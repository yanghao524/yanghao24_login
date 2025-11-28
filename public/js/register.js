/**
 * 用户注册页面脚本
 * 负责表单验证、密码强度检测、验证码生成和表单提交
 */

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
    
    // 存储验证码到会话中，用于验证
    sessionStorage.setItem('captchaCode', captchaText);
}

/**
 * 检测密码强度
 * @param {string} password 要检测的密码
 * @returns {Object} 包含强度等级和提示的对象
 */
function checkPasswordStrength(password) {
    let strength = 0;
    let tips = [];
    
    // 长度检查
    if (password.length >= 8) {
        strength++;
        tips.push('✓ 长度符合要求');
    } else {
        tips.push('✗ 长度至少8个字符');
    }
    
    // 包含小写字母
    if (/[a-z]/.test(password)) {
        strength++;
        tips.push('✓ 包含小写字母');
    } else {
        tips.push('✗ 缺少小写字母');
    }
    
    // 包含大写字母
    if (/[A-Z]/.test(password)) {
        strength++;
        tips.push('✓ 包含大写字母');
    } else {
        tips.push('✗ 缺少大写字母');
    }
    
    // 包含数字
    if (/\d/.test(password)) {
        strength++;
        tips.push('✓ 包含数字');
    } else {
        tips.push('✗ 缺少数字');
    }
    
    // 包含特殊字符
    if (/[^a-zA-Z0-9]/.test(password)) {
        strength++;
        tips.push('✓ 包含特殊字符');
    } else {
        tips.push('✗ 可以添加特殊字符提高安全性');
    }
    
    // 确定强度等级
    let level = 'weak';
    if (strength >= 4) {
        level = 'strong';
    } else if (strength >= 3) {
        level = 'medium';
    }
    
    return {
        strength: strength,
        level: level,
        tips: tips
    };
}

/**
 * 更新密码强度显示
 * @param {string} password 要检测的密码
 */
function updatePasswordStrength(password) {
    const strengthContainer = document.getElementById('passwordStrength');
    
    if (!password) {
        strengthContainer.innerHTML = '';
        return;
    }
    
    const result = checkPasswordStrength(password);
    
    // 创建强度条
    let strengthBar = `<div class="password-strength-bar">
        <div class="strength-bar-fill strength-bar-${result.level}" style="width: ${result.strength * 20}%"></div>
    </div>`;
    
    // 创建强度文本
    let strengthText = `<div class="strength-${result.level}">`;
    switch (result.level) {
        case 'weak':
            strengthText += '密码强度：弱';
            break;
        case 'medium':
            strengthText += '密码强度：中';
            break;
        case 'strong':
            strengthText += '密码强度：强';
            break;
    }
    strengthText += '</div>';
    
    // 创建提示列表
    let tipsList = '<div style="font-size: 12px; margin-top: 5px; color: #666;">';
    result.tips.forEach(tip => {
        tipsList += `<div>${tip}</div>`;
    });
    tipsList += '</div>';
    
    // 更新显示
    strengthContainer.innerHTML = strengthBar + strengthText + tipsList;
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
 * 验证用户名
 * @param {string} username 用户名
 * @returns {boolean} 是否验证通过
 */
function validateUsername(username) {
    if (!username) {
        showError('username', '请输入用户名');
        return false;
    }
    
    if (username.length < 3 || username.length > 50) {
        showError('username', '用户名长度必须在3-50个字符之间');
        return false;
    }
    
    hideError('username');
    return true;
}

/**
 * 验证密码
 * @param {string} password 密码
 * @returns {boolean} 是否验证通过
 */
function validatePassword(password) {
    if (!password) {
        showError('password', '请输入密码');
        return false;
    }
    
    const result = checkPasswordStrength(password);
    if (result.strength < 3) {
        showError('password', '密码强度不足，请按照提示完善');
        return false;
    }
    
    hideError('password');
    return true;
}

/**
 * 验证确认密码
 * @param {string} password 密码
 * @param {string} confirmPassword 确认密码
 * @returns {boolean} 是否验证通过
 */
function validateConfirmPassword(password, confirmPassword) {
    if (!confirmPassword) {
        showError('confirmPassword', '请再次输入密码');
        return false;
    }
    
    if (password !== confirmPassword) {
        showError('confirmPassword', '两次输入的密码不一致');
        return false;
    }
    
    hideError('confirmPassword');
    return true;
}

/**
 * 验证邮箱
 * @param {string} email 邮箱
 * @returns {boolean} 是否验证通过
 */
function validateEmail(email) {
    if (!email) {
        showError('email', '请输入电子邮箱');
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('email', '请输入有效的电子邮箱地址');
        return false;
    }
    
    hideError('email');
    return true;
}

/**
 * 验证手机号码
 * @param {string} phone 手机号码
 * @returns {boolean} 是否验证通过
 */
function validatePhone(phone) {
    if (!phone) {
        hideError('phone');
        return true; // 手机号码可选
    }
    
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
        showError('phone', '请输入有效的手机号码');
        return false;
    }
    
    hideError('phone');
    return true;
}

/**
 * 验证验证码
 * @param {string} captcha 验证码
 * @returns {boolean} 是否验证通过
 */
function validateCaptcha(captcha) {
    if (!captcha) {
        showError('captcha', '请输入验证码');
        return false;
    }
    
    const storedCaptcha = sessionStorage.getItem('captchaCode') || '';
    if (captcha.toUpperCase() !== storedCaptcha) {
        showError('captcha', '验证码不正确');
        return false;
    }
    
    hideError('captcha');
    return true;
}

/**
 * 验证整个表单
 * @returns {boolean} 表单是否验证通过
 */
function validateForm() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const captcha = document.getElementById('captcha').value;
    
    let isValid = true;
    
    // 逐个验证字段
    if (!validateUsername(username)) isValid = false;
    if (!validatePassword(password)) isValid = false;
    if (!validateConfirmPassword(password, confirmPassword)) isValid = false;
    if (!validateEmail(email)) isValid = false;
    if (!validatePhone(phone)) isValid = false;
    if (!validateCaptcha(captcha)) isValid = false;
    
    if (isValid) {
        // 表单验证通过，提交表单
        submitForm();
    }
    
    return false; // 阻止默认提交
}

/**
 * 提交表单到服务器
 */
async function submitForm() {
    const form = document.getElementById('register-form');
    const button = document.getElementById('registerButton');
    const originalButtonText = button.textContent;
    
    // 显示加载状态
    button.textContent = '注册中...';
    button.disabled = true;
    
    try {
        // 获取表单数据
        const formData = new FormData(form);
        const data = {
            username: formData.get('username'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            email: formData.get('email'),
            phone: formData.get('phone')
        };
        
        // 发送AJAX请求
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 注册成功，跳转到登录页面
            alert('注册成功！请登录');
            window.location.href = '/login.html';
        } else {
            // 注册失败，显示错误信息
            if (result.errors && result.errors.length > 0) {
                // 显示具体字段错误
                result.errors.forEach(error => {
                    const fieldName = error.param;
                    if (fieldName && document.getElementById(fieldName + 'Error')) {
                        showError(fieldName, error.msg);
                    }
                });
            } else {
                // 显示通用错误
                alert(result.message || '注册失败，请稍后重试');
            }
            // 刷新验证码
            generateCaptcha();
        }
    } catch (error) {
        console.error('注册请求失败:', error);
        alert('网络错误，请稍后重试');
        // 刷新验证码
        generateCaptcha();
    } finally {
        // 恢复按钮状态
        button.textContent = originalButtonText;
        button.disabled = false;
    }
}

/**
 * 页面加载完成后初始化
 */
window.onload = function() {
    // 生成初始验证码
    generateCaptcha();
    
    // 为密码输入框添加实时强度检测
    const passwordInput = document.getElementById('password');
    passwordInput.addEventListener('input', function() {
        updatePasswordStrength(this.value);
        validatePassword(this.value);
    });
    
    // 为确认密码输入框添加实时验证
    const confirmPasswordInput = document.getElementById('confirmPassword');
    confirmPasswordInput.addEventListener('input', function() {
        validateConfirmPassword(passwordInput.value, this.value);
    });
    
    // 为其他字段添加实时验证
    document.getElementById('username').addEventListener('input', function() {
        validateUsername(this.value);
    });
    
    document.getElementById('email').addEventListener('input', function() {
        validateEmail(this.value);
    });
    
    document.getElementById('phone').addEventListener('input', function() {
        validatePhone(this.value);
    });
    
    document.getElementById('captcha').addEventListener('input', function() {
        validateCaptcha(this.value);
    });
};
