export const dashboardService = {
  getDashboardData: async () => {
    // Dummy API (replace later with real backend)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          balance: 125000,
          income: 50000,
          expense: 20000,
          notifications: 3,
        });
      }, 1000);
    });
  },
};