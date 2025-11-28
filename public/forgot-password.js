/**
 * 密码找回页面脚本
 * 负责密码找回流程的前端逻辑
 */

// 存储当前用户名
let currentUsername = '';

/**
 * 获取当前错误次数
 * @returns {number} 当前错误次数
 */
function getErrorCount() {
    const count = sessionStorage.getItem('securityAnswerErrorCount');
    return count ? parseInt(count) : 0;
}

/**
 * 设置错误次数
 * @param {number} count 错误次数
 */
function setErrorCount(count) {
    sessionStorage.setItem('securityAnswerErrorCount', count.toString());
}

/**
 * 重置错误次数
 */
function resetErrorCount() {
    sessionStorage.removeItem('securityAnswerErrorCount');
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
        errorElement.style.color = '#ff4d4f';
        errorElement.style.fontSize = '12px';
        errorElement.style.marginTop = '8px';
        inputElement.classList.add('error');
        inputElement.style.border = '2px solid #ff4d4f';
        inputElement.style.borderStyle = 'solid';
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
        inputElement.style.border = '';
    }
}

/**
 * 切换到阶段1：验证用户名
 */
function goToStep1() {
    // 隐藏所有阶段
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    
    // 更新进度指示器
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        if (index === 0) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // 显示阶段1
    document.getElementById('step1').classList.add('active');
    document.getElementById('success-message').style.display = 'none';
}

/**
 * 切换到阶段2：验证安全问题
 */
function goToStep2() {
    // 隐藏所有阶段
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    
    // 更新进度指示器
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        if (index <= 1) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // 显示阶段2
    document.getElementById('step2').classList.add('active');
    document.getElementById('success-message').style.display = 'none';
    
    // 获取安全问题
    getSecurityQuestion();
}

/**
 * 切换到阶段3：重置密码
 */
function goToStep3() {
    // 隐藏所有阶段
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    
    // 更新进度指示器
    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.add('active');
    });
    
    // 显示阶段3
    document.getElementById('step3').classList.add('active');
    document.getElementById('success-message').style.display = 'none';
}

/**
 * 显示成功消息
 */
function showSuccessMessage() {
    // 隐藏所有阶段
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    
    // 显示成功消息
    document.getElementById('success-message').style.display = 'block';
}

/**
 * 取消密码重置，返回登录页面
 */
function cancelReset() {
    window.location.href = 'login.html';
}

/**
 * 返回登录页面
 */
function goToLogin() {
    window.location.href = 'login.html';
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
 * 验证用户名
 * @returns {boolean} 是否验证通过
 */
function validateUsername() {
    const username = document.getElementById('username').value;
    
    if (!username) {
        showError('username', '请输入用户名');
        return false;
    }
    
    // 隐藏错误信息
    hideError('username');
    
    // 检查用户名
    checkUsername(username);
    
    return false; // 阻止默认提交
}

/**
 * 验证安全问题答案
 * @returns {boolean} 是否验证通过
 */
function validateSecurityAnswer() {
    const securityAnswer = document.getElementById('securityAnswer').value;
    
    if (!securityAnswer) {
        showError('securityAnswer', '请输入答案');
        return false;
    }
    
    // 隐藏错误信息
    hideError('securityAnswer');
    
    // 验证答案
    verifySecurityAnswer(securityAnswer);
    
    return false; // 阻止默认提交
}

/**
 * 验证重置密码表单
 * @returns {boolean} 是否验证通过
 */
function validateResetPassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    let isValid = true;
    
    // 验证新密码
    const passwordResult = checkPasswordStrength(newPassword);
    if (passwordResult.strength < 3) {
        showError('newPassword', '密码强度不足，请按照提示完善');
        isValid = false;
    } else {
        hideError('newPassword');
    }
    
    // 验证确认密码
    if (!confirmPassword) {
        showError('confirmPassword', '请再次输入密码');
        isValid = false;
    } else if (newPassword !== confirmPassword) {
        showError('confirmPassword', '两次输入的密码不一致');
        isValid = false;
    } else {
        hideError('confirmPassword');
    }
    
    if (isValid) {
        // 重置密码
        resetPassword(newPassword);
    }
    
    return false; // 阻止默认提交
}

/**
 * 检查用户名是否存在
 * @param {string} username 用户名
 */
async function checkUsername(username) {
    try {
        const response = await fetch('/api/users/forgot-password/verify-username', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 用户名验证通过，进入下一阶段，重置错误次数
            currentUsername = username;
            resetErrorCount();
            goToStep2();
        } else {
            // 用户名验证失败，显示模糊错误提示
            showError('username', '密码找回失败，可能原因：用户名错误、安全问题选择错误或答案不正确');
        }
    } catch (error) {
        console.error('检查用户名失败:', error);
        showError('username', '网络错误，请稍后重试');
    }
}

/**
 * 获取用户的安全问题
 */
async function getSecurityQuestion() {
    try {
        // 确保currentUsername不为空
        if (!currentUsername) {
            showError('securityAnswer', '用户名不能为空');
            return;
        }
        
        const response = await fetch('/api/users/forgot-password/get-security-question', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: currentUsername })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 显示安全问题
            document.getElementById('securityQuestion').textContent = result.securityQuestion;
        } else {
            // 获取安全问题失败，显示模糊错误提示
            showError('securityAnswer', '密码找回失败，可能原因：用户名错误、安全问题选择错误或答案不正确');
        }
    } catch (error) {
        console.error('获取安全问题失败:', error);
        showError('securityAnswer', '网络错误，请稍后重试');
    }
}

/**
 * 验证安全问题答案
 * @param {string} answer 安全问题答案
 */
async function verifySecurityAnswer(answer) {
    try {
        const response = await fetch('/api/users/forgot-password/verify-answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: currentUsername, securityAnswer: answer })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 安全问题验证通过，重置错误次数并进入下一阶段
            resetErrorCount();
            goToStep3();
        } else {
            // 安全问题验证失败，处理错误次数
            let errorCount = getErrorCount();
            errorCount++;
            setErrorCount(errorCount);
            
            if (errorCount >= 5) {
                // 连续错误超过5次，显示错误提示并跳转到登录页面
                showError('securityAnswer', '答案连续输入错误超过5次，强制退出');
                // 延迟跳转，让用户看到错误提示
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            } else {
                // 显示具体的错误信息
                showError('securityAnswer', '答案不正确');
            }
        }
    } catch (error) {
        console.error('验证安全问题答案失败:', error);
        showError('securityAnswer', '网络错误，请稍后重试');
    }
}

/**
 * 重置密码
 * @param {string} newPassword 新密码
 */
async function resetPassword(newPassword) {
    try {
        const response = await fetch('/api/users/forgot-password/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: currentUsername, newPassword })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 密码重置成功，显示成功消息
            showSuccessMessage();
        } else {
            // 密码重置失败，显示错误信息
            showError('confirmPassword', result.message || '密码重置失败，请稍后重试');
        }
    } catch (error) {
        console.error('重置密码失败:', error);
        showError('confirmPassword', '网络错误，请稍后重试');
    }
}

/**
 * 页面加载完成后初始化
 */
window.onload = function() {
    // 为新密码输入框添加实时强度检测
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });
    }
    
    // 为确认密码输入框添加实时验证
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput && newPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            if (this.value && this.value !== newPasswordInput.value) {
                showError('confirmPassword', '两次输入的密码不一致');
            } else {
                hideError('confirmPassword');
            }
        });
    }
    
    // 为所有取消按钮添加点击事件监听器
    const cancelButtons = document.querySelectorAll('.cancel-button');
    cancelButtons.forEach(button => {
        button.addEventListener('click', cancelReset);
    });
    
    // 为所有返回登录按钮添加点击事件监听器
    const loginButtons = document.querySelectorAll('.login-button');
    loginButtons.forEach(button => {
        button.addEventListener('click', goToLogin);
    });
    
    // 为所有上一步按钮添加点击事件监听器
    const backButtons = document.querySelectorAll('.back-button');
    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (document.getElementById('step2').classList.contains('active')) {
                goToStep1();
            } else if (document.getElementById('step3').classList.contains('active')) {
                goToStep2();
            }
        });
    });
    
    // 为所有表单添加submit事件监听器，替换HTML中的onsubmit属性
    const usernameForm = document.getElementById('username-form');
    if (usernameForm) {
        usernameForm.addEventListener('submit', function(event) {
            event.preventDefault(); // 阻止默认提交行为
            validateUsername();
        });
    }
    
    const securityForm = document.getElementById('security-form');
    if (securityForm) {
        securityForm.addEventListener('submit', function(event) {
            event.preventDefault(); // 阻止默认提交行为
            validateSecurityAnswer();
        });
    }
    
    const resetForm = document.getElementById('reset-form');
    if (resetForm) {
        resetForm.addEventListener('submit', function(event) {
            event.preventDefault(); // 阻止默认提交行为
            validateResetPassword();
        });
    }
};
