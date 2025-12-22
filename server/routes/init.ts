import { Router } from 'express';
import { sql } from '../../lib/db.js';
import { INITIAL_TEAMS, INITIAL_NEWS, INITIAL_ANNOUNCEMENT } from '../../src/constants/index.js';

const router = Router();

router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

router.get('/', async (req, res) => {
  // 简单的安全验证
  const secret = req.query.secret as string;
  if (secret !== process.env.INIT_SECRET && secret !== 'aigc-init-2024') {
    return res.status(403).json({ success: false, message: '无权限' });
  }

  try {
    // 1. 插入初始团队数据
    let successCount = 0;
    const errors = [];
    
    for (const team of INITIAL_TEAMS) {
      try {
        // 插入团队
        await sql`
          INSERT INTO teams (
            id, title, icon_key, task, cycle, workload, 
            budget, actual_cost, progress, status, notes, 
            cover_image, images, links
          ) VALUES (
            ${team.id}, ${team.title}, ${team.iconKey}, ${team.task}, 
            ${team.cycle}, ${team.workload}, ${team.budget}, 
            ${team.actualCost}, ${team.progress}, ${team.status}, 
            ${team.notes}, ${team.coverImage}, 
            ${JSON.stringify(team.images)}, ${JSON.stringify(team.links)}
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
            links = EXCLUDED.links
        `;

        // 删除旧的成员和 todos
        await sql`DELETE FROM members WHERE team_id = ${team.id}`;
        await sql`DELETE FROM todos WHERE team_id = ${team.id}`;

        // 插入成员
        for (const member of team.members) {
          await sql`
            INSERT INTO members (id, team_id, name, is_director, avatar, role)
            VALUES (${member.id}, ${team.id}, ${member.name}, ${member.isDirector}, ${member.avatar}, ${member.role})
            ON CONFLICT (id) DO NOTHING
          `;
        }

        // 插入 todos
        for (const todo of team.todos) {
          await sql`
            INSERT INTO todos (id, team_id, text, done)
            VALUES (${todo.id}, ${team.id}, ${todo.text}, ${todo.done})
            ON CONFLICT (id) DO NOTHING
          `;
        }
        
        successCount++;
      } catch (teamError: any) {
        console.error(`插入团队 ${team.id} 失败:`, teamError);
        errors.push({ team: team.id, error: teamError.message });
      }
    }

    // 2. 插入初始新闻数据
    for (const newsItem of INITIAL_NEWS) {
      await sql`
        INSERT INTO news (id, date, type, priority, title, url)
        VALUES (${newsItem.id}, ${newsItem.date}, ${newsItem.type}, ${newsItem.priority}, ${newsItem.title}, ${newsItem.url})
        ON CONFLICT (id) DO UPDATE SET
          date = EXCLUDED.date,
          type = EXCLUDED.type,
          priority = EXCLUDED.priority,
          title = EXCLUDED.title,
          url = EXCLUDED.url
      `;
    }

    // 3. 插入初始公告
    await sql`
      INSERT INTO announcement (id, content)
      VALUES (1, ${INITIAL_ANNOUNCEMENT})
      ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content
    `;

    return res.status(200).json({ 
      success: true, 
      message: errors.length > 0 
        ? `部分初始化成功：${successCount}/${INITIAL_TEAMS.length} 个团队` 
        : '数据库初始化成功！',
      initialized: {
        teams: successCount,
        totalTeams: INITIAL_TEAMS.length,
        news: INITIAL_NEWS.length,
        announcement: true,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error: any) {
    console.error('数据库初始化失败:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || '初始化失败' 
    });
  }
});

export default router;

