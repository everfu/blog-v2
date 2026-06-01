<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
	<xsl:output method="html" indent="yes" />

	<xsl:template match="/">
		<html lang="{atom:feed/@xml:lang}">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<title><xsl:value-of select="atom:feed/atom:title" /> - Atom Feed</title>
			<link rel="stylesheet" href="/atom.css" />
			<link rel="icon" href="{atom:feed/atom:icon}" />
		</head>

		<body>
			<header class="feed-header">
				<img class="feed-logo" src="{atom:feed/atom:logo}" alt="" />
				<div>
					<p class="feed-kicker">Atom Feed</p>
					<h1><xsl:value-of select="atom:feed/atom:title" /></h1>
					<p class="feed-subtitle"><xsl:value-of select="atom:feed/atom:subtitle" /></p>
				</div>
			</header>

			<section class="feed-note">
				<p>这是本站的 Atom 订阅源，可复制当前地址到 RSS 阅读器订阅。</p>
				<a href="{atom:feed/atom:link[@rel='alternate']/@href}">返回网站首页</a>
			</section>

			<main>
				<xsl:apply-templates select="atom:feed/atom:entry" />
			</main>

			<footer>
				<xsl:value-of select="atom:feed/atom:rights" />
				<span> · </span>
				由 <xsl:value-of select="atom:feed/atom:generator" /> 生成
			</footer>
		</body>
		</html>
	</xsl:template>

	<xsl:template match="atom:entry">
		<a href="{atom:link/@href}" class="entry">
			<xsl:variable name="img-src" select="substring-before(substring-after(substring-after(atom:content, '&lt;img'), 'src=&quot;'), '&quot;')" />

			<article>
				<div class="entry-body">
					<div class="entry-meta">
						<time><xsl:value-of select="substring(atom:published, 1, 10)" /></time>
						<xsl:if test="atom:category">
							<span><xsl:value-of select="atom:category[1]/@term" /></span>
						</xsl:if>
					</div>

					<h2><xsl:value-of select="atom:title" /></h2>

					<xsl:if test="atom:summary">
						<p class="entry-summary"><xsl:value-of select="atom:summary" /></p>
					</xsl:if>

					<span class="entry-link">阅读全文</span>
				</div>

				<xsl:if test="$img-src">
					<img class="entry-image" src="{$img-src}" alt="{atom:title}" loading="lazy" />
				</xsl:if>
			</article>
		</a>
	</xsl:template>
</xsl:stylesheet>
