module.exports = {
  isActive: true,
  server: {
    port: 3000,
    host: 'localhost'
  },
  services: {
    alipay: {
      title: 'Alipay',
      descritpion: 'Dịch vụ thanh toán alipay',
      rules: {
        // Thông báo trong khoản thời gian. Ví dụ trong 300 giây có 10 lỗi xuất hiện sẽ alert
        period: {
          duration: 300,
          count: 10,
          set: {
            status: true,
            level: 'WARNING'
          }
        }
      }
    }  
  },
  handleAlert: () => {
    
  }
};
