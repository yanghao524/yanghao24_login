/**
 * 昵称修改成功页面脚本
 * 实现返回登录成功页面的功能
 */

/**
 * 返回登录成功页面
 */
function goBackToDashboard() {
    window.location.href = 'dashboard.html';
}

/**
 * 页面加载完成后初始化
 */
window.addEventListener('DOMContentLoaded', function() {
    // 获取当前用户名，设置默认值为'用户'
    const username = sessionStorage.getItem('currentUsername') || '用户';
    // 无论是否获取到用户名，都更新显示
    document.getElementById('userName').textContent = username;
    
    // 为返回按钮添加点击事件
    document.getElementById('backBtn').addEventListener('click', goBackToDashboard);
    
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
