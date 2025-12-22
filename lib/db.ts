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
        COALESCE(t.images, '[]') as images,
        COALESCE(t.unfinished_works, '[]') as unfinished_works,
        COALESCE(t.finished_works, '[]') as finished_works,
        COALESCE(t.consumption_records, '[]') as consumption_records
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

// 更新团队数据（支持新增和更新）
export async function updateTeam(team: any) {
  try {
    // 调试：打印要保存的作品数据
    const unfinishedWorks = team.unfinishedWorks || team.unfinished_works || [];
    const finishedWorks = team.finishedWorks || team.finished_works || [];
    const unfinishedWorksStr = JSON.stringify(unfinishedWorks);
    const finishedWorksStr = JSON.stringify(finishedWorks);
    
    console.log(`[DB] 保存团队 ${team.id}:`, {
      unfinishedWorks: Array.isArray(unfinishedWorks) ? unfinishedWorks.length : 'not array',
      finishedWorks: Array.isArray(finishedWorks) ? finishedWorks.length : 'not array',
      unfinishedWorksRaw: unfinishedWorksStr.substring(0, 100),
      finishedWorksRaw: finishedWorksStr.substring(0, 100)
    });
    
    // 使用 UPSERT：如果 id 存在则更新，不存在则插入
    // 对于 JSONB 字段，直接传递数组/对象，让 PostgreSQL 自动转换
    const imagesArray = team.images || [];
    const linksArray = team.links || [];
    const unfinishedWorksArray = unfinishedWorks;
    const finishedWorksArray = finishedWorks;
    const consumptionRecords = team.consumptionRecords || team.consumption_records || [];
    
    const result = await sql`
      INSERT INTO teams (
        id, title, icon_key, task, cycle, workload, 
        budget, actual_cost, progress, status, notes, 
        cover_image, images, links, unfinished_works, finished_works, consumption_records
      ) VALUES (
        ${team.id}, ${team.title}, ${team.iconKey || team.icon_key || 'default'}, ${team.task || ''}, 
        ${team.cycle || ''}, ${team.workload || ''}, ${team.budget || 0}, 
        ${team.actualCost || team.actual_cost || 0}, ${team.progress || 0}, 
        ${team.status || 'normal'}, ${team.notes || ''}, 
        ${team.coverImage || team.cover_image || ''}, 
        ${JSON.stringify(imagesArray)}::jsonb, 
        ${JSON.stringify(linksArray)}::jsonb,
        ${JSON.stringify(unfinishedWorksArray)}::jsonb,
        ${JSON.stringify(finishedWorksArray)}::jsonb,
        ${JSON.stringify(consumptionRecords)}::jsonb
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        icon_key = EXCLUDED.icon_key,
        task = EXCLUDED.task,
        cycle = EXCLUDED.cycle,
        workload = EXCLUDED.workload,
        budget = EXCLUDED.budget,
        actual_cost = EXCLUDED.actual_cost,
        progress = EXCLUDED.progress,
        status = EXCLUDED.status,
        notes = EXCLUDED.notes,
        cover_image = EXCLUDED.cover_image,
        images = EXCLUDED.images,
        links = EXCLUDED.links,
        unfinished_works = EXCLUDED.unfinished_works,
        finished_works = EXCLUDED.finished_works,
        consumption_records = EXCLUDED.consumption_records,
        updated_at = CURRENT_TIMESTAMP
    `;

    console.log(`[DB] 团队 ${team.id} 保存成功，影响行数:`, result.rowCount);
    
    // 验证保存结果 - 等待一小段时间确保事务提交
    await new Promise(resolve => setTimeout(resolve, 100));
    const { rows: verifyRows } = await sql`
      SELECT unfinished_works, finished_works 
      FROM teams 
      WHERE id = ${team.id}
    `;
    if (verifyRows.length > 0) {
      const dbUnfinished = verifyRows[0].unfinished_works;
      const dbFinished = verifyRows[0].finished_works;
      console.log(`[DB] 验证保存结果:`, {
        unfinished_works: dbUnfinished,
        finished_works: dbFinished,
        unfinished_type: typeof dbUnfinished,
        finished_type: typeof dbFinished,
        unfinished_is_array: Array.isArray(dbUnfinished),
        finished_is_array: Array.isArray(dbFinished),
        unfinished_count: Array.isArray(dbUnfinished) ? dbUnfinished.length : 'not array',
        finished_count: Array.isArray(dbFinished) ? dbFinished.length : 'not array',
        expected_unfinished: unfinishedWorks.length,
        expected_finished: finishedWorks.length
      });
      
      // 如果数据不匹配，记录详细错误
      const unfinishedMatch = Array.isArray(dbUnfinished) && dbUnfinished.length === unfinishedWorks.length;
      const finishedMatch = Array.isArray(dbFinished) && dbFinished.length === finishedWorks.length;
      if (!unfinishedMatch || !finishedMatch) {
        console.error(`[DB] ❌ 数据不匹配！`, {
          unfinished: { expected: unfinishedWorks.length, actual: Array.isArray(dbUnfinished) ? dbUnfinished.length : 'N/A' },
          finished: { expected: finishedWorks.length, actual: Array.isArray(dbFinished) ? dbFinished.length : 'N/A' }
        });
      }
    } else {
      console.error(`[DB] ❌ 验证失败：未找到团队 ${team.id}`);
    }

    // 删除旧的成员和 todos，重新插入
    await sql`DELETE FROM members WHERE team_id = ${team.id}`;
    await sql`DELETE FROM todos WHERE team_id = ${team.id}`;

    // 插入成员
    if (team.members && team.members.length > 0) {
      for (const member of team.members) {
        await sql`
          INSERT INTO members (id, team_id, name, is_director, avatar, role)
          VALUES (${member.id}, ${team.id}, ${member.name}, ${member.isDirector}, ${member.avatar || ''}, ${member.role})
          ON CONFLICT (id) DO UPDATE SET
            team_id = EXCLUDED.team_id,
            name = EXCLUDED.name,
            is_director = EXCLUDED.is_director,
            avatar = EXCLUDED.avatar,
            role = EXCLUDED.role
        `;
      }
    }

    // 插入 todos
    if (team.todos && team.todos.length > 0) {
      for (const todo of team.todos) {
        await sql`
          INSERT INTO todos (id, team_id, text, done)
          VALUES (${todo.id}, ${team.id}, ${todo.text}, ${todo.done})
          ON CONFLICT (id) DO UPDATE SET
            team_id = EXCLUDED.team_id,
            text = EXCLUDED.text,
            done = EXCLUDED.done
        `;
      }
    }

    return { success: true };
  } catch (error) {
    console.error('更新团队数据失败:', error);
    throw error;
  }
}

// 删除团队（同时级联删除 members / todos）
export async function deleteTeam(teamId: string) {
  try {
    await sql`DELETE FROM members WHERE team_id = ${teamId}`;
    await sql`DELETE FROM todos WHERE team_id = ${teamId}`;
    await sql`DELETE FROM teams WHERE id = ${teamId}`;
    return { success: true };
  } catch (error) {
    console.error('删除团队失败:', error);
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

