const CryptoJS = require('crypto-js');
const readline = require('readline');

// ساخت رابط کاربری برای دریافت ورودی کاربر
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

// درخواست هش رمزنگاری‌شده از کاربر
rl.question('Enter the encrypted hash (with Salt and HMAC): ', (input) => {
  rl.question('Enter your username: ', (username) => {
    rl.question('Enter your password: ', (password) => {

      // جدا کردن Salt، داده‌های رمزنگاری شده و HMAC
      let parts = input.split(':');
      let salt = parts[0];
      let encryptedHash = parts[1];
      let providedHMAC = parts[2];

      // ساخت کلید با استفاده از Salt و Iteration
      let iterations = 10000;  // تعداد تکرار مناسب
      let secretKey = generateKey(username + password, salt, iterations);

      // تولید HMAC برای اعتبارسنجی داده‌های رمزنگاری شده
      let validHMAC = generateHMAC(encryptedHash, secretKey);

      // بررسی صحت HMAC
      if (validHMAC === providedHMAC) {
        try {
          // بازگشایی فایل JSON
          let decryptedJsonBytes = CryptoJS.AES.decrypt(encryptedHash, secretKey);
          let decryptedJson = decryptedJsonBytes.toString(CryptoJS.enc.Utf8);

          if (decryptedJson) {
            console.log("Decrypted JSON Content: ", decryptedJson);
          } else {
            console.log("Invalid username or password. Decryption failed.");
          }
        } catch (error) {
          console.error("Error during decryption:", error.message);
        }
      } else {
        console.log("HMAC validation failed. Data integrity compromised.");
      }

      rl.close();
    });
  });
});
