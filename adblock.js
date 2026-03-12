// adblock.js
document.addEventListener("DOMContentLoaded", function() {
    // Tìm tất cả các iframe có nguồn từ abyss.to
    const iframes = document.querySelectorAll('iframe');
    
    iframes.forEach(iframe => {
        if (iframe.src.includes('abyss.to')) {
            // THIẾT QUÂN LUẬT:
            // allow-scripts: Cho phép chạy trình phát video
            // allow-same-origin: Cho phép load dữ liệu video
            // allow-forms: Cho phép các tương tác cơ bản
            // KHÔNG CÓ allow-popups và allow-top-navigation: Chặn đứng mọi nỗ lực nhảy tab/redirect
            iframe.setAttribute('sandbox', 'allow-forms allow-scripts allow-same-origin allow-presentation');
            
            // Ngăn chặn việc gửi thông tin referer để Abyss khó phát hiện đang bị "vây hãm"
            iframe.setAttribute('referrerpolicy', 'no-referrer');
            
            console.log("Đã khóa mục tiêu: " + iframe.src);
        }
    });
});
