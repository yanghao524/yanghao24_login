/**
 * 修改昵称页面脚本
 * 实现昵称唯一性验证和表单提交功能
 */

/**
 * 显示错误信息
 * @param {string} fieldId 字段ID
 * @param {string} message 错误信息
 */
function showError(fieldId, message) {
    // 处理昵称字段的特殊情况
    const actualFieldId = fieldId === 'newNickname' ? 'nickname' : fieldId;
    const errorElement = document.getElementById(actualFieldId + 'Error');
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
    // 处理昵称字段的特殊情况
    const actualFieldId = fieldId === 'newNickname' ? 'nickname' : fieldId;
    const errorElement = document.getElementById(actualFieldId + 'Error');
    const inputElement = document.getElementById(fieldId);
    if (errorElement && inputElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        inputElement.classList.remove('error');
    }
}

/**
 * 验证昵称
 * @param {string} nickname 昵称
 * @returns {boolean} 是否验证通过
 */
function validateNickname(nickname) {
    if (!nickname) {
        // 输入为空，不显示错误信息，由updateNicknameValidationStatus函数处理
        return false;
    }
    
    if (nickname.length < 1 || nickname.length > 20) {
        showError('newNickname', '昵称长度必须在1-20个字符之间');
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
    const nicknameInput = document.getElementById('newNickname');
    const nicknameError = document.getElementById('nicknameError');
    const nicknameValidationIcon = document.getElementById('nicknameValidationIcon');
    const confirmButton = document.getElementById('confirmBtn');
    
    // 获取当前输入值
    const nickname = nicknameInput.value;
    
    if (nickname === '') {
        // 输入框为空，隐藏错误信息，禁用确认按钮
        hideError('newNickname');
        nicknameValidationIcon.textContent = '';
        nicknameValidationIcon.className = 'validation-icon';
        nicknameInput.classList.remove('error');
        confirmButton.disabled = true;
    } else if (isValid && isUnique) {
        // 昵称有效且唯一
        hideError('newNickname');
        nicknameValidationIcon.textContent = '✓';
        nicknameValidationIcon.className = 'validation-icon valid';
        nicknameInput.classList.remove('error');
        // 启用确认按钮
        confirmButton.disabled = false;
    } else {
        // 昵称无效或不唯一
        showError('newNickname', errorMessage || '该昵称已被使用，请更换其他昵称');
        nicknameValidationIcon.textContent = '';
        nicknameValidationIcon.className = 'validation-icon';
        nicknameInput.classList.add('error');
        // 禁用确认按钮
        confirmButton.disabled = true;
    }
}

/**
 * 取消修改昵称，返回登录成功页面
 */
function cancelNicknameChange() {
    window.location.href = 'dashboard.html';
}

/**
 * 提交表单，修改昵称
 * @param {Event} event 表单提交事件
 */
async function submitNicknameForm(event) {
    event.preventDefault();
    
    const newNickname = document.getElementById('newNickname').value;
    const isValid = validateNickname(newNickname);
    
    if (!isValid) {
        return;
    }
    
    // 检查昵称唯一性
    const isUnique = await checkNicknameUniqueness(newNickname);
    
    if (!isUnique) {
        updateNicknameValidationStatus(isValid, isUnique);
        return;
    }
    
    try {
        // 获取当前用户名
        const username = sessionStorage.getItem('currentUsername');
        
        // 提交修改请求
        const response = await fetch('/api/users/update-nickname', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, nickname: newNickname })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 更新sessionStorage中的昵称
            sessionStorage.setItem('currentUserNickname', newNickname);
            // 跳转到修改成功页面
            window.location.href = 'nickname-success.html';
        } else {
            // 显示错误信息
            showError('newNickname', result.message || '昵称修改失败，请稍后重试');
        }
    } catch (error) {
        console.error('修改昵称失败:', error.message);
        showError('newNickname', '网络错误，请稍后重试');
    }
}

/**
 * 页面加载完成后初始化
 */
window.addEventListener('DOMContentLoaded', function() {
    // 获取当前用户名，设置默认值为'用户'
    const username = sessionStorage.getItem('currentUsername') || '用户';
    // 无论是否获取到用户名，都更新显示
    document.getElementById('userName').textContent = username;
    
    // 为新昵称输入框添加实时验证和唯一性检查
    const nicknameInput = document.getElementById('newNickname');
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
    
    // 为取消按钮添加点击事件
    document.getElementById('cancelBtn').addEventListener('click', cancelNicknameChange);
    
    // 为表单添加提交事件
    document.getElementById('nickname-form').addEventListener('submit', submitNicknameForm);
    
    // 为退出登录按钮添加点击事件
    document.getElementById('logoutBtn').addEventListener('click', function() {
        // 清除sessionStorage
        sessionStorage.removeItem('currentUsername');
        sessionStorage.removeItem('currentUserNickname');
        sessionStorage.removeItem('captchaCode');
        // 跳转到登录页面
        window.location.href = 'login.html';
    });
});
