const fs = require('fs');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  for (const { search, replace } of replacements) {
    content = content.replace(search, replace);
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed ' + filePath);
  }
}

// 1. Fix Layout.tsx stuttering
replaceInFile('src/components/home-ui/Layout.tsx', [
  {
    search: /className=\{\`sticky top-0 bg-white\/95 backdrop-blur-md border-b border-pink-100 z-\[90\] transition-all duration-300 flex items-center \$\{scrolled \? "h-16 shadow-sm" : "h-\[72px\]"\}\`\}/g,
    replace: 'className={`sticky top-0 bg-white/95 backdrop-blur-md border-b z-[90] transition-shadow duration-300 flex items-center h-[72px] ${scrolled ? "border-pink-100 shadow-sm" : "border-pink-50"}`}'
  }
]);

// 2. Fix literal '?' currency in specific files
const filesWithBraces = [
  'src/components/dashboard/OrderDetailsModal.tsx',
  'src/components/admin/SmsCouponModal.tsx',
  'src/components/admin/GlobalWalletNotice.tsx',
  'src/app/admin/wallet/page.tsx',
  'src/app/(store)/profile/wishlist/page.tsx',
  'src/app/(store)/profile/wallet/page.tsx',
  'src/app/(store)/profile/orders/page.tsx',
  'src/app/(store)/checkout/page.tsx',
  'src/app/admin/locations/page.tsx',
  'src/app/admin/coupons/page.tsx',
  'src/app/admin/facebook-manager/page.tsx'
];

filesWithBraces.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/\?\{/g, 'Tk {');
    // Fix false positive in register/page.tsx just in case
    content = content.replace(/Already have an accountTk \{/g, 'Already have an account?{');
    fs.writeFileSync(f, content, 'utf8');
    console.log('Currency fixed in ' + f);
  }
});

const filesWithDollarBraces = [
  'src/app/(store)/checkout/page.tsx',
  'src/app/admin/coupons/page.tsx'
];
filesWithDollarBraces.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/\`\?\$\{orderTotals\.subtotal/g, '`Tk ${orderTotals.subtotal');
    content = content.replace(/\`\?\$\{orderTotals\.deliveryFee/g, '`Tk ${orderTotals.deliveryFee');
    content = content.replace(/\`\?\$\{orderTotals\.total/g, '`Tk ${orderTotals.total');
    content = content.replace(/\`\?\$\{coupon\.discount/g, '`Tk ${coupon.discount');
    fs.writeFileSync(f, content, 'utf8');
    console.log('Currency (template) fixed in ' + f);
  }
});

// We also have cases of literal ?290 inside code or ?200
replaceInFile('src/components/admin/SmsCouponModal.tsx', [
  { search: 'Balance: ?\n', replace: 'Balance: Tk \n' }
]);
