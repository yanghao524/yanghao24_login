/**
 * 用户注册页面脚本
 * 负责表单验证、密码强度检测、验证码生成和表单提交
 */

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
    const inputElement = document.getElementById(fieldId);
    if (errorElement && inputElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        inputElement.classList.add('error');
    }
}

/**
 * 隐藏错误信息
 * @param {string} fieldId 字段ID
 */
function hideError(fieldId) {
    const errorElement = document.getElementById(fieldId + 'Error');
    const inputElement = document.getElementById(fieldId);
    if (errorElement && inputElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        inputElement.classList.remove('error');
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
    
    // 万能验证码验证：输入"7777"直接通过验证
    if (captcha === UNIVERSAL_CAPTCHA) {
        console.log('使用了万能验证码，直接通过验证');
        hideError('captcha');
        return true;
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
 * 验证安全验证问题
 * @param {string} securityQuestion 验证问题
 * @returns {boolean} 是否验证通过
 */
function validateSecurityQuestion(securityQuestion) {
    if (!securityQuestion) {
        showError('securityQuestion', '请选择安全验证问题');
        return false;
    }
    
    hideError('securityQuestion');
    return true;
}

/**
 * 验证安全验证答案
 * @param {string} securityAnswer 验证答案
 * @returns {boolean} 是否验证通过
 */
function validateSecurityAnswer(securityAnswer) {
    if (!securityAnswer) {
        showError('securityAnswer', '请输入安全验证答案');
        return false;
    }
    
    if (securityAnswer.length < 4 || securityAnswer.length > 20) {
        showError('securityAnswer', '答案长度必须在4-20个字符之间');
        return false;
    }
    
    hideError('securityAnswer');
    return true;
}

/**
 * 验证昵称
 * @param {string} nickname 昵称
 * @returns {boolean} 是否验证通过
 */
function validateNickname(nickname) {
    if (!nickname) {
        showError('nickname', '请输入昵称');
        return false;
    }
    
    if (nickname.length < 1 || nickname.length > 20) {
        showError('nickname', '昵称长度必须在1-20个字符之间');
        return false;
    }
    
    return true;
}

/**
 * 检查昵称唯一性
 * @param {string} nickname 昵称
 * @returns {Promise<boolean>} 昵称是否可用
 */
async function checkNicknameUniqueness(nickname) {
    try {
        const response = await fetch('/api/users/check-nickname', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nickname })
        });
        
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('检查昵称唯一性失败:', error.message);
        return false;
    }
}

/**
 * 更新昵称验证状态
 * @param {boolean} isValid 昵称是否有效
 * @param {boolean} isUnique 昵称是否唯一
 * @param {string} errorMessage 错误信息
 */
function updateNicknameValidationStatus(isValid, isUnique, errorMessage = '') {
    const nicknameInput = document.getElementById('nickname');
    const nicknameError = document.getElementById('nicknameError');
    const nicknameValidationIcon = document.getElementById('nicknameValidationIcon');
    const registerButton = document.getElementById('registerButton');
    
    if (isValid && isUnique) {
        // 昵称有效且唯一
        hideError('nickname');
        nicknameValidationIcon.textContent = '✓';
        nicknameValidationIcon.className = 'validation-icon valid';
        nicknameInput.classList.remove('error');
        // 启用注册按钮（需要检查其他字段是否也有效）
        validateAllFields();
    } else {
        // 昵称无效或不唯一
        showError('nickname', errorMessage || '该昵称已被使用，请更换其他昵称');
        nicknameValidationIcon.textContent = '';
        nicknameValidationIcon.className = 'validation-icon';
        nicknameInput.classList.add('error');
        // 禁用注册按钮
        registerButton.disabled = true;
    }
}

/**
 * 验证所有字段，更新注册按钮状态
 */
function validateAllFields() {
    const registerButton = document.getElementById('registerButton');
    const nicknameInput = document.getElementById('nickname');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const securityQuestionInput = document.getElementById('securityQuestion');
    const securityAnswerInput = document.getElementById('securityAnswer');
    const captchaInput = document.getElementById('captcha');
    
    // 检查所有必填字段是否都已填写且有效
    const isNicknameValid = !nicknameInput.classList.contains('error') && nicknameInput.value.trim() !== '';
    const isUsernameValid = !usernameInput.classList.contains('error') && usernameInput.value.trim() !== '';
    const isPasswordValid = !passwordInput.classList.contains('error') && passwordInput.value.trim() !== '';
    const isConfirmPasswordValid = !confirmPasswordInput.classList.contains('error') && confirmPasswordInput.value.trim() !== '';
    const isEmailValid = !emailInput.classList.contains('error') && emailInput.value.trim() !== '';
    const isPhoneValid = !phoneInput.classList.contains('error');
    const isSecurityQuestionValid = !securityQuestionInput.classList.contains('error') && securityQuestionInput.value.trim() !== '';
    const isSecurityAnswerValid = !securityAnswerInput.classList.contains('error') && securityAnswerInput.value.trim() !== '';
    const isCaptchaValid = !captchaInput.classList.contains('error') && captchaInput.value.trim() !== '';
    
    // 更新注册按钮状态
    registerButton.disabled = !(isNicknameValid && isUsernameValid && isPasswordValid && isConfirmPasswordValid && 
                               isEmailValid && isPhoneValid && isSecurityQuestionValid && isSecurityAnswerValid && 
                               isCaptchaValid);
}

/**
 * 验证整个注册表单
 * @param {Event} event 表单提交事件
 * @returns {boolean} 表单是否验证通过
 */
async function validateRegisterForm(event) {
    console.log('validateRegisterForm函数被调用');
    
    // 明确阻止默认的表单提交行为
    event.preventDefault();
    console.log('默认提交行为已阻止');
    
    // 全量验证所有字段
    let isFormValid = true;
    
    // 获取表单数据
    const username = document.getElementById('username').value;
    const nickname = document.getElementById('nickname').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const securityQuestion = document.getElementById('securityQuestion').value;
    const securityAnswer = document.getElementById('securityAnswer').value;
    const captcha = document.getElementById('captcha').value;
    
    // 验证每个字段
    if (!validateUsername(username)) isFormValid = false;
    if (!validateNickname(nickname)) isFormValid = false;
    if (!validatePassword(password)) isFormValid = false;
    if (!validateConfirmPassword(password, confirmPassword)) isFormValid = false;
    if (!validateEmail(email)) isFormValid = false;
    if (!validatePhone(phone)) isFormValid = false;
    if (!validateSecurityQuestion(securityQuestion)) isFormValid = false;
    if (!validateSecurityAnswer(securityAnswer)) isFormValid = false;
    if (!validateCaptcha(captcha)) isFormValid = false;
    
    // 如果表单验证通过，提交表单
    if (isFormValid) {
        try {
            console.log('表单验证通过，开始提交表单');
            await submitForm();
            console.log('表单提交完成');
        } catch (error) {
            console.error('表单提交失败:', error);
            // 显示通用错误信息
            showError('username', '注册失败，请稍后重试');
        }
    } else {
        console.log('表单验证失败，存在错误字段');
    }
    
    return false; // 阻止默认提交
}

/**
 * 提交表单到服务器
 */
async function submitForm() {
    console.log('submitForm函数被调用');
    
    const form = document.getElementById('register-form');
    const button = document.getElementById('registerButton');
    const originalButtonText = button.textContent;
    
    // 显示加载状态
    button.textContent = '注册中...';
    button.disabled = true;
    
    try {
        // 获取表单数据
        const username = document.getElementById('username').value;
        const nickname = document.getElementById('nickname').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const securityQuestion = document.getElementById('securityQuestion').value;
        const securityAnswer = document.getElementById('securityAnswer').value;
        
        const data = {
            username,
            nickname,
            password,
            confirmPassword,
            email,
            phone: phone || undefined, // 将空字符串转换为undefined，以便服务器端的optional()验证规则生效
            securityQuestion,
            securityAnswer
        };
        
        console.log('准备发送注册请求:', data);
        
        // 发送AJAX请求
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        console.log('注册请求已发送，响应状态:', response.status);
        
        // 解析响应数据
        let result;
        try {
            result = await response.json();
            console.log('响应数据解析成功:', result);
        } catch (jsonError) {
            console.error('JSON解析错误:', jsonError);
            // 显示通用错误信息
            showError('username', '注册失败，请稍后重试');
            // 刷新验证码
            generateCaptcha();
            return;
        }
        
        if (result.success) {
            // 注册成功，跳转到注册成功页面
            console.log('注册成功，准备跳转到成功页面');
            window.location.href = 'register-success.html';
        } else {
            // 注册失败，显示错误信息
            console.log('注册失败，错误信息:', result);
            if (result.errors && Array.isArray(result.errors)) {
                // 显示具体字段错误
                result.errors.forEach(error => {
                    const fieldName = error.param;
                    if (fieldName && document.getElementById(fieldName + 'Error')) {
                        showError(fieldName, error.msg);
                    }
                });
            } else if (result.message) {
                // 显示服务器返回的通用错误信息
                // 根据错误信息内容，尝试匹配到具体字段
                if (result.message.includes('用户名')) {
                    showError('username', result.message);
                } else if (result.message.includes('邮箱')) {
                    showError('email', result.message);
                } else if (result.message.includes('手机号')) {
                    showError('phone', result.message);
                } else {
                    // 无法匹配到具体字段时，显示在用户名字段下方
                    showError('username', result.message);
                }
            } else {
                // 显示默认错误信息
                showError('username', '注册失败，请稍后重试');
            }
            // 刷新验证码
            generateCaptcha();
        }
    } catch (error) {
        console.error('注册请求失败:', error);
        // 显示网络错误信息
        showError('username', '网络错误，请稍后重试');
        // 刷新验证码
        generateCaptcha();
    } finally {
        // 恢复按钮状态
        button.textContent = originalButtonText;
        button.disabled = false;
        console.log('按钮状态已恢复');
    }
}

/**
 * 页面加载完成后初始化
 */
(function() {
    console.log('register.js初始化代码开始执行');
    
    // 生成初始验证码
    generateCaptcha();
    
    // 为验证码容器添加点击事件监听器
    const captchaImage = document.getElementById('captchaImage');
    captchaImage.addEventListener('click', generateCaptcha);
    
    // 为昵称输入框添加实时验证和唯一性检查
    const nicknameInput = document.getElementById('nickname');
    let nicknameTimeout;
    
    nicknameInput.addEventListener('input', function() {
        const nickname = this.value;
        const isValid = validateNickname(nickname);
        
        // 清除之前的定时器
        clearTimeout(nicknameTimeout);
        
        if (isValid && nickname.length > 0) {
            // 延迟检查唯一性，避免频繁请求
            nicknameTimeout = setTimeout(async () => {
                const isUnique = await checkNicknameUniqueness(nickname);
                updateNicknameValidationStatus(isValid, isUnique);
            }, 500);
        } else {
            // 昵称无效，更新状态
            updateNicknameValidationStatus(isValid, false, '');
        }
    });
    
    nicknameInput.addEventListener('blur', async function() {
        const nickname = this.value;
        const isValid = validateNickname(nickname);
        
        if (isValid && nickname.length > 0) {
            const isUnique = await checkNicknameUniqueness(nickname);
            updateNicknameValidationStatus(isValid, isUnique);
        }
    });
    
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
        validateAllFields();
    });
    
    // 为验证问题和答案添加实时验证
    document.getElementById('securityQuestion').addEventListener('change', function() {
        validateSecurityQuestion(this.value);
        validateAllFields();
    });
    
    document.getElementById('securityAnswer').addEventListener('input', function() {
        validateSecurityAnswer(this.value);
        validateAllFields();
    });
    
    document.getElementById('captcha').addEventListener('input', function() {
        validateCaptcha(this.value);
        validateAllFields();
    });
    
    // 为用户名和邮箱添加实时验证和按钮状态更新
    document.getElementById('username').addEventListener('input', function() {
        validateUsername(this.value);
        validateAllFields();
    });
    
    document.getElementById('email').addEventListener('input', function() {
        validateEmail(this.value);
        validateAllFields();
    });
    
    document.getElementById('confirmPassword').addEventListener('input', function() {
        validateConfirmPassword(passwordInput.value, this.value);
        validateAllFields();
    });
    
    // 为注册表单添加submit事件监听器，确保能正确处理异步验证
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        console.log('找到了register-form表单，开始添加submit事件监听器');
        registerForm.addEventListener('submit', async function(event) {
            console.log('注册表单submit事件被触发');
            event.preventDefault();
            await validateRegisterForm(event);
        });
        console.log('submit事件监听器添加成功');
    } else {
        console.error('没有找到register-form表单');
    }
    
    console.log('register.js初始化代码执行完成');
})();
