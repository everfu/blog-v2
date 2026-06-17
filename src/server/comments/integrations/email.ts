import nodemailer from 'nodemailer'
import { siteConfig } from '@/config/site'
import type { AdminComment } from '../contracts/types'
import { getCommentSmtpSettings } from '../application/settings'

interface FriendApplicationEmailPayload {
  id: string
  authorName: string
  siteName: string
  description: string
  siteUrl: string
  avatarUrl?: string | null
  feedUrl?: string | null
  contact: string
  note?: string | null
}

function escapeHtml(value: string | null | undefined) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function buildPageUrl(path: string) {
  const baseUrl = siteConfig.url.replace(/\/$/, '')
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

function buildShell(title: string, content: string) {
  return `
    <div style="margin:0;padding:24px;background:#f6f6f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#171717;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
        <div style="padding:20px 24px;border-bottom:1px solid #e5e5e5;">
          <div style="font-size:12px;color:#737373;margin-bottom:6px;">${escapeHtml(siteConfig.name)}</div>
          <h1 style="margin:0;font-size:20px;line-height:1.35;color:#171717;">${escapeHtml(title)}</h1>
        </div>
        <div style="padding:24px;font-size:14px;line-height:1.7;color:#262626;">
          ${content}
        </div>
      </div>
    </div>
  `
}

function detailRow(label: string, value: string | null | undefined) {
  if (!value) return ''
  return `
    <tr>
      <td style="width:88px;padding:6px 0;color:#737373;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:6px 0;color:#171717;">${escapeHtml(value)}</td>
    </tr>
  `
}

function quoteBlock(value: string) {
  return `<div style="margin:16px 0;padding:14px 16px;border-left:3px solid #171717;background:#fafafa;white-space:pre-wrap;">${escapeHtml(value)}</div>`
}

async function getTransport() {
  const settings = await getCommentSmtpSettings()
  if (!settings.enabled || !settings.host || !settings.fromEmail) return null

  return {
    settings,
    transporter: nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: settings.username || settings.password
        ? {
            user: settings.username,
            pass: settings.password,
          }
        : undefined,
    }),
  }
}

export async function sendTestCommentEmail(to: string) {
  const transport = await getTransport()
  if (!transport) {
    return { ok: false, message: 'SMTP 未启用或配置不完整。' }
  }

  await transport.transporter.sendMail({
    from: {
      name: transport.settings.fromName || siteConfig.name,
      address: transport.settings.fromEmail,
    },
    to,
    subject: `${siteConfig.name} 评论邮件测试`,
    html: buildShell('评论邮件测试', '<p style="margin:0;">如果你收到了这封邮件，说明 SMTP 配置可以正常发送评论提醒。</p>'),
  })

  return { ok: true, message: '测试邮件已发送。' }
}

export async function notifyOwnerForNewComment(comment: AdminComment) {
  const transport = await getTransport()
  if (!transport || !transport.settings.ownerEmail) return false

  const pageUrl = buildPageUrl(comment.pagePath)
  const adminUrl = buildPageUrl(`/admin/comments?status=pending&keyword=${encodeURIComponent(comment.id)}`)
  const ua = comment.uaSummary || '未知'
  const html = buildShell('有新的评论待审核', `
    <table style="width:100%;border-collapse:collapse;margin:0 0 14px;">
      ${detailRow('昵称', comment.authorName)}
      ${detailRow('邮箱', comment.authorEmail)}
      ${detailRow('网站', comment.website)}
      ${detailRow('页面', pageUrl)}
      ${detailRow('来源', comment.locationLabel)}
      ${detailRow('UA', ua)}
    </table>
    ${quoteBlock(comment.body)}
    <p style="margin:18px 0 0;">
      <a href="${adminUrl}" style="display:inline-block;background:#171717;color:#ffffff;text-decoration:none;border-radius:6px;padding:10px 14px;">前往后台审核</a>
    </p>
  `)

  await transport.transporter.sendMail({
    from: {
      name: transport.settings.fromName || siteConfig.name,
      address: transport.settings.fromEmail,
    },
    to: transport.settings.ownerEmail,
    subject: `新的评论待审核：${comment.authorName}`,
    html,
  })

  return true
}

export async function notifyOwnerForFriendApplication(application: FriendApplicationEmailPayload) {
  const transport = await getTransport()
  if (!transport || !transport.settings.ownerEmail) return false

  const adminUrl = buildPageUrl(`/admin/friends?application=${encodeURIComponent(application.id)}`)
  const html = buildShell('有新的友链申请待处理', `
    <table style="width:100%;border-collapse:collapse;margin:0 0 14px;">
      ${detailRow('站长', application.authorName)}
      ${detailRow('站点', application.siteName)}
      ${detailRow('网址', application.siteUrl)}
      ${detailRow('头像', application.avatarUrl)}
      ${detailRow('Feed', application.feedUrl)}
      ${detailRow('联系', application.contact)}
    </table>
    ${quoteBlock(application.description)}
    ${application.note ? `<div style="margin-top:16px;color:#737373;">备注</div>${quoteBlock(application.note)}` : ''}
    <p style="margin:18px 0 0;">
      <a href="${adminUrl}" style="display:inline-block;background:#171717;color:#ffffff;text-decoration:none;border-radius:6px;padding:10px 14px;">前往后台处理</a>
    </p>
  `)

  await transport.transporter.sendMail({
    from: {
      name: transport.settings.fromName || siteConfig.name,
      address: transport.settings.fromEmail,
    },
    to: transport.settings.ownerEmail,
    subject: `新的友链申请：${application.siteName}`,
    html,
  })

  return true
}

export async function notifyUserForReply(parent: AdminComment, reply: AdminComment) {
  const transport = await getTransport()
  if (!transport || !parent.authorEmail) return false

  const pageUrl = `${buildPageUrl(reply.pagePath)}#comment-${reply.id}`
  const html = buildShell('你的评论有了新回复', `
    <p style="margin:0 0 12px;">${escapeHtml(parent.authorName)}，你在 ${escapeHtml(siteConfig.name)} 的评论收到了回复。</p>
    <div style="margin-top:16px;color:#737373;">你的评论</div>
    ${quoteBlock(parent.body)}
    <div style="margin-top:16px;color:#737373;">回复内容</div>
    ${quoteBlock(reply.body)}
    <p style="margin:18px 0 0;">
      <a href="${pageUrl}" style="display:inline-block;background:#171717;color:#ffffff;text-decoration:none;border-radius:6px;padding:10px 14px;">查看回复</a>
    </p>
  `)

  await transport.transporter.sendMail({
    from: {
      name: transport.settings.fromName || siteConfig.name,
      address: transport.settings.fromEmail,
    },
    to: parent.authorEmail,
    subject: `${siteConfig.name} 上有人回复了你的评论`,
    html,
  })

  return true
}
