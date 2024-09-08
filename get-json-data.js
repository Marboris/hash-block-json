const fs = require('fs');
const CryptoJS = require('crypto-js');
const readline = require('readline');
const crypto = require('crypto');

// ساخت رابط کاربری برای دریافت ورودی کاربر
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// تابعی برای تولید یک Salt تصادفی
function generateSalt(length) {
  return crypto.randomBytes(length).toString('hex');
}

// تابعی برای ساخت کلید با استفاده از Salt و Iteration
function generateKey(password, salt, iterations) {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: iterations
  }).toString();
}

// تابعی برای تولید HMAC از داده‌ها
function generateHMAC(data, key) {
  return CryptoJS.HmacSHA256(data, key).toString();
}

// درخواست آدرس فایل JSON از کاربر
rl.question('Enter the path to the JSON file: ', (filePath) => {
  rl.question('Enter your username: ', (username) => {
    rl.question('Enter your password: ', (password) => {

      // خواندن فایل JSON
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error("Error reading the file:", err);
          rl.close();
          return;
        }

        // تولید Salt تصادفی
        let salt = generateSalt(16);

        // ترکیب یوزرنیم و پسورد برای ساخت کلید با استفاده از Salt و Iteration
        let iterations = 10000;  // تعداد تکرار مناسب
        let secretKey = generateKey(username + password, salt, iterations);

        // رمزنگاری فایل JSON با استفاده از AES
        let encryptedJson = CryptoJS.AES.encrypt(data, secretKey).toString();

        // تولید HMAC برای داده‌های رمزنگاری شده
        let hmac = generateHMAC(encryptedJson, secretKey);

        // ترکیب Salt، داده‌های رمزنگاری شده و HMAC
        let finalOutput = `${salt}:${encryptedJson}:${hmac}`;

        // نمایش هش نهایی
        console.log("Encrypted Hash (with Salt and HMAC): ", finalOutput);

        rl.close();
      });

    });
  });
});
