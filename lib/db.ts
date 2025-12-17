import { sql } from '@vercel/postgres';

/**
 * 数据库工具函数
 * 用于与 Vercel Postgres 交互
 * @vercel/postgres 会自动从环境变量读取 DATABASE_URL
 */

// 直接导出 sql，它会自动使用环境变量中的连接配置
export { sql };

// 获取所有团队数据（包含成员、todos等）
export async function getTeams() {
  try {
    const { rows } = await sql`
      SELECT 
        t.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', m.id,
              'name', m.name,
              'isDirector', m.is_director,
              'avatar', m.avatar,
              'role', m.role
            )
          ) FILTER (WHERE m.id IS NOT NULL), 
          '[]'
        ) as members,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', td.id,
              'text', td.text,
              'done', td.done
            )
          ) FILTER (WHERE td.id IS NOT NULL),
          '[]'
        ) as todos,
        COALESCE(t.links, '[]') as links,
        COALESCE(t.images, '[]') as images
      FROM teams t
      LEFT JOIN members m ON m.team_id = t.id
      LEFT JOIN todos td ON td.team_id = t.id
      GROUP BY t.id
      ORDER BY t.id
    `;
    return rows;
  } catch (error) {
    console.error('获取团队数据失败:', error);
    throw error;
  }
}

// 更新团队数据
export async function updateTeam(team: any) {
  try {
    // 更新团队基本信息
    await sql`
      UPDATE teams SET
        title = ${team.title},
        icon_key = ${team.iconKey || team.icon_key || 'default'},
        task = ${team.task || ''},
        cycle = ${team.cycle || ''},
        workload = ${team.workload || ''},
        budget = ${team.budget || 0},
        actual_cost = ${team.actualCost || team.actual_cost || 0},
        progress = ${team.progress || 0},
        status = ${team.status || 'normal'},
        notes = ${team.notes || ''},
        cover_image = ${team.coverImage || team.cover_image || ''},
        images = ${JSON.stringify(team.images || [])},
        links = ${JSON.stringify(team.links || [])}
      WHERE id = ${team.id}
    `;

    // 删除旧的成员和 todos，重新插入
    await sql`DELETE FROM members WHERE team_id = ${team.id}`;
    await sql`DELETE FROM todos WHERE team_id = ${team.id}`;

    // 插入成员
    if (team.members && team.members.length > 0) {
      for (const member of team.members) {
        await sql`
          INSERT INTO members (id, team_id, name, is_director, avatar, role)
          VALUES (${member.id}, ${team.id}, ${member.name}, ${member.isDirector}, ${member.avatar || ''}, ${member.role})
        `;
      }
    }

    // 插入 todos
    if (team.todos && team.todos.length > 0) {
      for (const todo of team.todos) {
        await sql`
          INSERT INTO todos (id, team_id, text, done)
          VALUES (${todo.id}, ${team.id}, ${todo.text}, ${todo.done})
        `;
      }
    }

    return { success: true };
  } catch (error) {
    console.error('更新团队数据失败:', error);
    throw error;
  }
}

// 获取所有新闻
export async function getNews() {
  try {
    const { rows } = await sql`
      SELECT * FROM news ORDER BY date DESC, id DESC
    `;
    return rows;
  } catch (error) {
    console.error('获取新闻失败:', error);
    throw error;
  }
}

// 添加新闻
export async function addNews(news: any) {
  try {
    await sql`
      INSERT INTO news (id, date, type, priority, title, url)
      VALUES (${news.id}, ${news.date}, ${news.type}, ${news.priority}, ${news.title}, ${news.url})
    `;
    return { success: true };
  } catch (error) {
    console.error('添加新闻失败:', error);
    throw error;
  }
}

// 更新新闻
export async function updateNews(news: any) {
  try {
    await sql`
      UPDATE news SET
        date = ${news.date},
        type = ${news.type},
        priority = ${news.priority},
        title = ${news.title},
        url = ${news.url}
      WHERE id = ${news.id}
    `;
    return { success: true };
  } catch (error) {
    console.error('更新新闻失败:', error);
    throw error;
  }
}

// 删除新闻
export async function deleteNews(id: string) {
  try {
    await sql`DELETE FROM news WHERE id = ${id}`;
    return { success: true };
  } catch (error) {
    console.error('删除新闻失败:', error);
    throw error;
  }
}

// 获取公告
export async function getAnnouncement() {
  try {
    const { rows } = await sql`
      SELECT content FROM announcement WHERE id = 1
    `;
    return rows[0]?.content || '';
  } catch (error) {
    console.error('获取公告失败:', error);
    throw error;
  }
}

// 更新公告
export async function updateAnnouncement(content: string) {
  try {
    await sql`
      INSERT INTO announcement (id, content)
      VALUES (1, ${content})
      ON CONFLICT (id) DO UPDATE SET content = ${content}
    `;
    return { success: true };
  } catch (error) {
    console.error('更新公告失败:', error);
    throw error;
  }
}

