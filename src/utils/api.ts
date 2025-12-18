/**
 * API 客户端工具
 * 用于与后端 Vercel Serverless Functions 通信
 */

const API_BASE = '/api';

// 通用请求函数
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // 注意：后端可能返回非 JSON（例如 413 Request Entity Too Large 的 HTML/纯文本），不能直接 response.json()
    const rawText = await response.text();
    let data: any = null;
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      data = { message: rawText || '请求失败' };
    }

    if (!response.ok) {
      throw new Error(data.message || '请求失败');
    }

    return data;
  } catch (error) {
    console.error('API 请求错误:', error);
    throw error;
  }
}

// 团队相关 API
export const teamsAPI = {
  // 获取所有团队
  getAll: async () => {
    const result = await fetchAPI('/teams');
    return result.data;
  },

  // 更新团队
  update: async (team: any) => {
    await fetchAPI('/teams', {
      method: 'PUT',
      body: JSON.stringify(team),
    });
  },

  // 删除团队
  delete: async (id: string) => {
    await fetchAPI(`/teams?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

// 新闻相关 API
export const newsAPI = {
  // 获取所有新闻
  getAll: async () => {
    const result = await fetchAPI('/news');
    return result.data;
  },

  // 添加新闻
  add: async (news: any) => {
    await fetchAPI('/news', {
      method: 'POST',
      body: JSON.stringify(news),
    });
  },

  // 更新新闻
  update: async (news: any) => {
    await fetchAPI('/news', {
      method: 'PUT',
      body: JSON.stringify(news),
    });
  },

  // 删除新闻
  delete: async (id: string) => {
    await fetchAPI(`/news?id=${id}`, {
      method: 'DELETE',
    });
  },
};

// 公告相关 API
export const announcementAPI = {
  // 获取公告
  get: async () => {
    const result = await fetchAPI('/announcement');
    return result.data;
  },

  // 更新公告
  update: async (content: string) => {
    await fetchAPI('/announcement', {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },
};

// 批量保存所有数据
export const saveAllData = async (teams: any[], announcement: string) => {
  try {
    // 保存所有团队
    await Promise.all(teams.map(team => teamsAPI.update(team)));
    
    // 更新公告
    await announcementAPI.update(announcement);
    
    return { success: true };
  } catch (error) {
    console.error('批量保存失败:', error);
    throw error;
  }
};

