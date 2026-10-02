document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Sayfanın yenilenmesini engeller
    
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    
    // Demo şifre kontrolü
    if (user === 'admin' && pass === '1234') {
        window.location.href = "dashboard.html";
    } else {
        alert('Hatalı kullanıcı adı veya şifre! (İpucu: admin / 1234)');
    }
});