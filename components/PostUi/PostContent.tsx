'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import createDOMPurify from 'dompurify';
import Post from '@/lib/models/post';
import PostMedia from './PostMedia';
import PostTemplateTags from './PostTemplateTags';
import { formatDate } from '@/lib/utils';
import { getPostTypeLabel, isSceneCommunityPostType, splitPostTags } from '@/lib/scenePosts';

export default function PostContent(props:{post:Post, googleMapsApiKey:string | undefined}) {
	const post = props.post;
	const [cleanContent, setCleanContent] = useState<string>(post.content);
	const [templateTagArr, setTemplateTagArr] = useState<Array<{
				tag: string,
				index: number,
				tagText: string
			}>>();
    const displayTitle = post.headline || post.eventTitle
    const postTags = splitPostTags(post.tags)
    const sceneTypeLabel = isSceneCommunityPostType(post.postType) ? getPostTypeLabel(post.postType) : null

	const parseTemplateTags = (post:string) => {
		let placeholder = post;

		if (post.match(/\[(.*?)\]/g)) {
			const results = Array.from(placeholder.matchAll(/\[(.*?)\]/g), match => {
				if (match[1].includes('/')) return;
				const open = match.index + match[0].length + 7; //7 for the following </span>
				const close = placeholder.indexOf('[/', match.index) - 6;
				const tagText = placeholder.slice(open, close)
				placeholder = placeholder.slice(0, match.index) + tagText + placeholder.slice(placeholder.indexOf('[/', match.index) + 3 + match[1].length)

				return {
					tag: match[1],
					index: match.index,
					tagText
				}
			});

			const templateTags = results.filter((element) => {
				return element !== undefined;
			})

			setTemplateTagArr(templateTags)
		}

		return placeholder
	}

	const parseLinks = (post:string) => {
		let placeholder = post;
		const editorLinks = [...post.matchAll(/editor-link/g)];

		if (editorLinks && editorLinks.length) {
			for(let i = 0; i < editorLinks.length; i++) {
				const indexA = placeholder.indexOf('<a');
				const fullLink = placeholder.substring(indexA, placeholder.indexOf('</a>', indexA) + 4)
				if (fullLink.match(/giphy/)) {
					placeholder = placeholder.slice(0, indexA)
				} else {
					let linkText, linkLength, linkIndex, linkEnd;

					if (fullLink.match(/http:/)) {
						linkIndex = placeholder.indexOf('http://',editorLinks[i].index);
					} else {
						linkIndex = placeholder.indexOf('https://',editorLinks[i].index);
					}

					linkEnd = placeholder.indexOf('</span>',linkIndex);
					linkLength = placeholder.substring(linkIndex, linkEnd).length;
					linkText = placeholder.slice(linkIndex);
					linkText = linkText.slice(0, linkEnd)
					linkText = linkText.substring((fullLink.match(/http:/)) ? 7 : 8,30)+'...'

					placeholder = `${placeholder.slice(0, linkIndex)}${linkText}${placeholder.slice(linkIndex + linkLength)}`
					placeholder = placeholder.slice(0, placeholder.indexOf('>',editorLinks[i].index)) + " target='_blank'" + placeholder.slice(placeholder.indexOf('>',editorLinks[i].index)) 
				}
			}

			post = placeholder;
		}

		if (post.match(/\[(.*?)\]/g)) {
			post = parseTemplateTags(post);
		}

		post = parseTags(post);

		setCleanContent(post);
	}

	const parseTags = (post:string):string => {
		let placeholder = post;
		const editorHashtags = [...post.matchAll(/editor-hashtag/g)];

		if (editorHashtags && editorHashtags.length) {
			const tags = [];

			for(let i = 0; i < editorHashtags.length; i++) {
				tags.push(placeholder.substring(placeholder.indexOf('#',editorHashtags[i].index), placeholder.indexOf('<',editorHashtags[i].index)))
			}

			for(let i = 0; i < tags.length; i++) {
				placeholder = placeholder.replace(tags[i], `<a href='/search/${tags[i].replace('#', '')}'>${tags[i]}</a>`)
			}

			post = placeholder;
		}

		return post;
	}

	useEffect(() => {
		parseLinks(createDOMPurify(window).sanitize(post.content));
	},[])

    return (
		<div>
			<div className='postContent'>
				{
					displayTitle &&
						<div className='text-2xl font-bold px-3 pt-3'><Link href={`/post/${post.id}`} title={displayTitle}>{displayTitle}</Link></div>
				}
				{
					post.eventDate &&
						<div className='mb-5 text-lg px-3'>{formatDate(post.eventDate)}</div>
				}
				{
					(sceneTypeLabel || post.status) &&
						<div className='mb-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide'>
							{sceneTypeLabel &&
								<div className='rounded-full bg-orange/10 px-3 py-1 text-orange-700'>{sceneTypeLabel}</div>
							}
							{post.status &&
								<div className='rounded-full bg-slate-100 px-3 py-1 text-slate-700'>{post.status}</div>
							}
						</div>
				}
				{
					(post.town || post.neighborhood || post.venueName || post.locationLabel) &&
						<div className='mb-4 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700'>
							<div className='flex flex-wrap gap-x-4 gap-y-1'>
								{post.town && <div>Town: <strong>{post.town}</strong></div>}
								{post.neighborhood && <div>Neighborhood: <strong>{post.neighborhood}</strong></div>}
								{post.venueName && <div>Venue: <strong>{post.venueName}</strong></div>}
								{post.locationLabel && <div>Address: <strong>{post.locationLabel}</strong></div>}
							</div>
						</div>
				}
				{
					post.seeking &&
						<div className='mb-4 rounded-2xl bg-orange/5 px-4 py-3 text-sm'>
							<div className='mb-1 font-semibold uppercase tracking-wide text-orange-700'>Seeking</div>
							<div>{post.seeking}</div>
						</div>
				}
				{
					postTags.length > 0 &&
						<div className='mb-4 flex flex-wrap gap-2 text-sm'>
							{postTags.map((tag) => (
								<Link key={tag} href={`/search/${encodeURIComponent(tag)}`} className='rounded-full bg-blue-50 px-3 py-1 text-blue-600'>
									#{tag}
								</Link>
							))}
						</div>
				}
				{ cleanContent && 
					<div>
						<div className='flex justify-end text-xs mb-2 me-2 italic'>{post.createdAt.toDateString()}</div>
						<div>{parse(cleanContent)}</div>
						<div className='text-sm pt-2 italic text-gray-1'>{(post.edited) ? 'edited' : ''}</div>
					</div>
				}
			</div>

			<PostMedia post={post}/>

			{templateTagArr && templateTagArr.length &&
				<PostTemplateTags templateTags={templateTagArr} googleMapsApiKey={props.googleMapsApiKey}/>
			}
		</div>
    )
}
