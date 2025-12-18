import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Agent 代理接口（给 juchacha 页面用）
 *
 * 目的：
 * - 前端只请求你的网站域名（避免 CORS / 暴露真实模型地址）
 * - 后端再转发到你配置的“公网可访问”的模型服务
 *
 * 环境变量（Vercel/服务器上配置）：
 * - AGENT_ENDPOINT: 必填。你的模型服务地址（OpenAI 兼容 / 你自定义都行）
 *   例：http://127.0.0.1:8000/v1/chat/completions（仅本机不行，要公网可达）
 * - AGENT_API_KEY: 可选。转发时附带 Authorization: Bearer xxx
 * - AGENT_ALLOWED_ORIGIN: 可选。CORS 白名单（默认 *）
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const allowOrigin = process.env.AGENT_ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: '方法不允许' });

  const endpoint = process.env.AGENT_ENDPOINT;
  if (!endpoint) {
    return res.status(500).json({
      success: false,
      message: '未配置 AGENT_ENDPOINT（需要配置公网可访问的模型服务地址）',
    });
  }

  try {
    const upstreamRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.AGENT_API_KEY ? { Authorization: `Bearer ${process.env.AGENT_API_KEY}` } : {}),
      },
      body: JSON.stringify(req.body || {}),
    });

    const text = await upstreamRes.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { reply: text };
    }

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({
        success: false,
        message: data?.error?.message || data?.message || `上游请求失败 (${upstreamRes.status})`,
        upstream: data,
      });
    }

    // 直接把上游数据透传回去（前端已兼容 OpenAI/简化两种）
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Agent API 错误:', error);
    return res.status(500).json({ success: false, message: error.message || '服务器错误' });
  }
}


