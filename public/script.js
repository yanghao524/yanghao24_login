/**
 * 万能验证码常量定义
 * 用于开发和调试，输入此值可直接通过验证码验证
 */
const UNIVERSAL_CAPTCHA = "7777";

/**
 * 生成4位大写字母和数字组合的验证码
 * @returns {string} 生成的验证码字符串
 */
function generateRandomCaptcha() {
    // 生成包含大写字母和数字的字符集
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let captcha = '';
    
    // 随机生成4位验证码
    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        captcha += chars[randomIndex];
    }
    
    return captcha;
}

/**
 * 在Canvas中绘制验证码，包含干扰线和噪点
 * @param {string} captcha 要绘制的验证码字符串
 */
function drawCaptcha(captcha) {
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 44;
    
    // 设置canvas样式，确保它能正确接收点击事件
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.cursor = 'pointer';
    
    const ctx = canvas.getContext('2d');
    
    // 设置背景色
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 添加干扰线
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        
        // 随机干扰线颜色
        const color = getRandomColor();
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.random() * 2 + 1;
        ctx.stroke();
    }
    
    // 添加噪点
    for (let i = 0; i < 100; i++) {
        ctx.beginPath();
        ctx.arc(
            Math.random() * canvas.width, 
            Math.random() * canvas.height, 
            Math.random() * 2,
            0, 
            Math.PI * 2
        );
        ctx.fillStyle = getRandomColor();
        ctx.fill();
    }
    
    // 绘制验证码文本
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 为每个字符设置随机颜色和位置
    for (let i = 0; i < captcha.length; i++) {
        ctx.fillStyle = getRandomColor();
        const x = 20 + i * 25 + Math.random() * 5;
        const y = canvas.height / 2 + (Math.random() - 0.5) * 15;
        const rotation = (Math.random() - 0.5) * 0.5;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.fillText(captcha[i], 0, 0);
        ctx.restore();
    }
    
    return canvas;
}

/**
 * 生成随机颜色，用于干扰线和文本
 * @returns {string} 随机颜色的RGB值
 */
function getRandomColor() {
    const colors = [
        '#000000', // 黑色
        '#333333', // 深灰
        '#666666', // 中灰
        '#990000', // 深红
        '#006600', // 深绿
        '#000099', // 深蓝
        '#660066'  // 深紫
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * 生成并显示新的验证码
 */
function generateCaptcha() {
    const captchaText = generateRandomCaptcha();
    const canvas = drawCaptcha(captchaText);
    const captchaImage = document.getElementById('captchaImage');
    
    // 清空验证码容器
    captchaImage.innerHTML = '';
    
    // 直接添加canvas
    captchaImage.appendChild(canvas);
    
    // 为canvas添加点击事件监听器，确保点击canvas也能刷新验证码
    canvas.addEventListener('click', generateCaptcha);
    
    // 存储验证码到会话中，用于验证
    sessionStorage.setItem('captchaCode', captchaText);
}

/**
 * 显示错误信息
 * @param {string} fieldId 字段ID
 * @param {string} message 错误信息
 */
function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        document.getElementById(fieldId).style.borderColor = '#e74c3c';
    } else {
        // 如果没有专门的错误元素，使用alert
        alert(message);
    }
}

/**
 * 隐藏错误信息
 * @param {string} fieldId 字段ID
 */
function hideError(fieldId) {
    const errorElement = document.getElementById(fieldId + 'Error');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        document.getElementById(fieldId).style.borderColor = '';
    }
}

/**
 * 验证表单输入
 * @param {Event} event 表单提交事件
 * @returns {boolean} 表单是否验证通过
 */
async function validateForm(event) {
    // 明确阻止默认的表单提交行为
    event.preventDefault();
    
    console.log('validateForm函数被调用');
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const captcha = document.getElementById('captcha').value;
    const storedCaptcha = sessionStorage.getItem('captchaCode') || '';
    
    // 隐藏所有错误信息
    hideError('username');
    hideError('password');
    hideError('captcha');
    
    // 简单的非空验证
    if (!username) {
        console.log('用户名不能为空');
        showError('username', '请输入用户名');
        return false;
    }
    
    if (!password) {
        console.log('密码不能为空');
        showError('password', '请输入密码');
        return false;
    }
    
    // 验证码验证（不区分大小写）
    if (!captcha) {
        console.log('验证码不能为空');
        showError('captcha', '请输入验证码');
        return false;
    }
    
    // 万能验证码验证：输入"7777"直接通过验证
    if (captcha === UNIVERSAL_CAPTCHA) {
        console.log('使用了万能验证码，直接通过验证');
        hideError('captcha');
    } else if (captcha.toUpperCase() !== storedCaptcha) {
        console.log('验证码输入错误');
        showError('captcha', '验证码输入错误');
        // 只刷新验证码和清空验证码输入框，保留用户名和密码
        generateCaptcha(); // 刷新验证码
        document.getElementById('captcha').value = '';
        // 聚焦到验证码输入框，方便用户重新输入
        document.getElementById('captcha').focus();
        return false;
    }
    
    // 调用后端API进行登录验证
    try {
        console.log('validateForm函数被调用，开始调用登录API');
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        console.log('API响应状态:', response.status);
        const result = await response.json();
        console.log('API响应结果:', result);
        
        if (result.success) {
            // 登录成功，直接跳转到dashboard页面，取消弹窗提示
            // 存储用户名和昵称到sessionStorage
            sessionStorage.setItem('currentUsername', username);
            // 无论nickname是否为空，都存储到sessionStorage中
            sessionStorage.setItem('currentUserNickname', result.user?.nickname || '');
            // 立即跳转到登录后的过渡页面
            window.location.href = 'dashboard.html';
        } else {
            // 登录失败，显示模糊错误提示
            console.log('登录失败，显示错误提示');
            showError('username', '用户名或密码错误');
        }
    } catch (error) {
        console.error('登录请求失败:', error);
        // 网络错误，显示模糊错误提示
        showError('username', '用户名或密码错误');
    }
    return false;
}

/**
 * 页面加载完成后初始化验证码
 */
window.onload = function() {
    console.log('window.onload函数被调用');
    
    // 只有在存在captchaImage元素时才生成验证码
    const captchaImage = document.getElementById('captchaImage');
    if (captchaImage) {
        // 生成初始验证码
        generateCaptcha();
        // 为验证码容器添加点击事件监听器
        captchaImage.addEventListener('click', generateCaptcha);
    }
    
    // 为表单添加submit事件监听器
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        console.log('找到了login-form表单，开始添加submit事件监听器');
        loginForm.addEventListener('submit', validateForm);
        console.log('submit事件监听器添加成功');
    }
    
    // 为注册成功页面的登录按钮添加点击事件监听器
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', function() {
            console.log('点击了跳转按钮');
            window.location.href = '/login.html';
        });
        console.log('登录按钮事件监听器已绑定');
    }
};