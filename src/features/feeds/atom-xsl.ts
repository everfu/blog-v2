export const atomXsl = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
\t<xsl:output method="html" indent="yes" />

\t<xsl:template match="/">
\t\t<html lang="{atom:feed/@xml:lang}">
\t\t<head>
\t\t\t<meta charset="UTF-8" />
\t\t\t<meta name="viewport" content="width=device-width, initial-scale=1.0" />
\t\t\t<title><xsl:value-of select="atom:feed/atom:title" /> - Atom Feed</title>
\t\t\t<link rel="stylesheet" href="/atom.css" />
\t\t\t<link rel="icon" href="{atom:feed/atom:icon}" />
\t\t</head>

\t\t<body>
\t\t\t<header class="feed-header">
\t\t\t\t<img class="feed-logo" src="{atom:feed/atom:logo}" alt="" />
\t\t\t\t<div>
\t\t\t\t\t<p class="feed-kicker">Atom Feed</p>
\t\t\t\t\t<h1><xsl:value-of select="atom:feed/atom:title" /></h1>
\t\t\t\t\t<p class="feed-subtitle"><xsl:value-of select="atom:feed/atom:subtitle" /></p>
\t\t\t\t</div>
\t\t\t</header>

\t\t\t<section class="feed-note">
\t\t\t\t<p>这是本站的 Atom 订阅源，可复制当前地址到 RSS 阅读器订阅。</p>
\t\t\t\t<a href="{atom:feed/atom:link[@rel='alternate']/@href}">返回网站首页</a>
\t\t\t</section>

\t\t\t<main>
\t\t\t\t<xsl:apply-templates select="atom:feed/atom:entry" />
\t\t\t</main>

\t\t\t<footer>
\t\t\t\t<xsl:value-of select="atom:feed/atom:rights" />
\t\t\t\t<span> · </span>
\t\t\t\t由 <xsl:value-of select="atom:feed/atom:generator" /> 生成
\t\t\t</footer>
\t\t</body>
\t\t</html>
\t</xsl:template>

\t<xsl:template match="atom:entry">
\t\t<a href="{atom:link/@href}" class="entry">
\t\t\t<xsl:variable name="img-src" select="substring-before(substring-after(substring-after(atom:content, '&lt;img'), 'src=&quot;'), '&quot;')" />

\t\t\t<article>
\t\t\t\t<div class="entry-body">
\t\t\t\t\t<div class="entry-meta">
\t\t\t\t\t\t<time><xsl:value-of select="substring(atom:published, 1, 10)" /></time>
\t\t\t\t\t\t<xsl:if test="atom:category">
\t\t\t\t\t\t\t<span><xsl:value-of select="atom:category[1]/@term" /></span>
\t\t\t\t\t\t</xsl:if>
\t\t\t\t\t</div>

\t\t\t\t\t<h2><xsl:value-of select="atom:title" /></h2>

\t\t\t\t\t<xsl:if test="atom:summary">
\t\t\t\t\t\t<p class="entry-summary"><xsl:value-of select="atom:summary" /></p>
\t\t\t\t\t</xsl:if>

\t\t\t\t\t<span class="entry-link">阅读全文</span>
\t\t\t\t</div>

\t\t\t\t<xsl:if test="$img-src">
\t\t\t\t\t<img class="entry-image" src="{$img-src}" alt="{atom:title}" loading="lazy" />
\t\t\t\t</xsl:if>
\t\t\t</article>
\t\t</a>
\t</xsl:template>
</xsl:stylesheet>
`
