#!/usr/bin/env bash
#
# نشر chathala-web على Contabo.
#
# لماذا ريموتان؟
#   origin  → GitHub، للحفظ والتاريخ. السيرفر لا يملك صلاحية عليه
#             (الريبو خاص وبلا مفتاح نشر) فلا يستطيع السحب منه.
#   contabo → شجرة العمل على السيرفر مباشرة عبر SSH. تعمل بفضل
#             receive.denyCurrentBranch=updateInstead المضبوط هناك.
#
# الاستخدام:  ./deploy.sh [--skip-github]

set -euo pipefail

REMOTE_HOST="contabo"
APP_DIR="/var/www/chathala-web"
PM2_NAME="chathala-web"
SITE="https://chathala.com"
BRANCH="main"

red()  { printf '\033[31m%s\033[0m\n' "$*"; }
grn()  { printf '\033[32m%s\033[0m\n' "$*"; }
info() { printf '\033[36m==> %s\033[0m\n' "$*"; }

skip_github=false
[[ "${1:-}" == "--skip-github" ]] && skip_github=true

# ---------------------------------------------------------------- فحوص مسبقة
info "فحص الحالة المحلية"
if [[ -n "$(git status --porcelain)" ]]; then
  red "توجد تغييرات غير مُودعة. أودعها أولاً:"
  git status --short
  exit 1
fi

current_branch="$(git branch --show-current)"
if [[ "$current_branch" != "$BRANCH" ]]; then
  red "أنت على الفرع '$current_branch' وليس '$BRANCH'."
  exit 1
fi

info "فحص الأنواع والبناء محلياً قبل لمس السيرفر"
npx tsc --noEmit
npm run build >/dev/null
grn "البناء المحلي نجح"

# ------------------------------------------------------------------- الدفع
if [[ "$skip_github" == false ]]; then
  info "دفع إلى GitHub (origin)"
  git push origin "$BRANCH"
fi

info "دفع إلى السيرفر (contabo)"
# npm على السيرفر يعيد كتابة package-lock.json (يحذف وسوم peer) بعد كل بناء،
# وupdateInstead يرفض الدفع ما دامت الشجرة غير نظيفة — نعيده للمُودَع أولاً.
ssh "$REMOTE_HOST" "cd $APP_DIR && git checkout -- package-lock.json"
git push contabo "$BRANCH"

# ------------------------------------------------- البناء وإعادة التشغيل
# ملاحظة: البناء يجب أن يتم على السيرفر — next/font و next/image يولّدان
# أصولاً وقت البناء، ومجلد .next غير مُتتبَّع في git.
info "البناء على السيرفر"
# ملاحظة: بلا --omit=dev — بناء Next يحتاج tailwind و typescript وهي devDependencies.
ssh "$REMOTE_HOST" "source ~/.nvm/nvm.sh && cd $APP_DIR && npm install --no-audit --no-fund >/dev/null && git checkout -- package-lock.json && npm run build"

info "إعادة تشغيل PM2"
ssh "$REMOTE_HOST" "source ~/.nvm/nvm.sh && pm2 restart $PM2_NAME --update-env >/dev/null && sleep 4 && pm2 list --no-color | grep $PM2_NAME"

# ------------------------------------------------------------------ التحقق
info "فحص الأخطاء في السجل"
if ssh "$REMOTE_HOST" "source ~/.nvm/nvm.sh && pm2 logs $PM2_NAME --lines 30 --nostream 2>&1" | grep -iE "^\s*(error|Error:)" ; then
  red "ظهرت أخطاء في السجل — راجعها أعلاه"
else
  grn "السجل نظيف"
fi

info "فحص الصفحات العامة"
failed=0
for path in / /about /download /support /contact /privacy /terms /login /register /sitemap.xml; do
  code="$(curl -s -o /dev/null -w '%{http_code}' "$SITE$path")"
  if [[ "$code" == "200" ]]; then
    printf '  %-16s %s\n' "$path" "$code"
  else
    red "$(printf '  %-16s %s' "$path" "$code")"
    failed=1
  fi
done

deployed="$(ssh "$REMOTE_HOST" "cd $APP_DIR && git rev-parse --short HEAD")"
local_head="$(git rev-parse --short HEAD)"

echo
if [[ "$failed" == 0 && "$deployed" == "$local_head" ]]; then
  grn "تم النشر بنجاح — $deployed"
else
  red "النشر انتهى بمشاكل (محلي: $local_head، السيرفر: $deployed)"
  exit 1
fi
