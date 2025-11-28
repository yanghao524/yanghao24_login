/**
 * 登录后页面脚本
 * 负责显示用户名和退出登录功能
 */

// 页面加载完成后执行
window.addEventListener('DOMContentLoaded', function() {
    // 获取当前用户名，设置默认值为'用户'
    const username = sessionStorage.getItem('currentUsername') || '用户';
    // 无论是否获取到用户名，都更新显示
    document.getElementById('userName').textContent = username;
    
    // 获取当前用户昵称，设置默认值为'新用户'
    const nickname = sessionStorage.getItem('currentUserNickname') || '新用户';
    // 无论昵称是否为空，都更新显示
    document.getElementById('userNickname').textContent = nickname;
    
    // 为修改昵称按钮添加点击事件
    document.getElementById('changeNicknameBtn').addEventListener('click', function() {
        // 跳转到昵称修改页面
        window.location.href = 'nickname-edit.html';
    });
    
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