'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import Post from '@/lib/models/post';
import PostMedia from './PostMedia';
import PostTemplateTags from './PostTemplateTags';
import { formatDate } from '@/lib/utils';

export default function PostContent(props:{post:Post, googleMapsApiKey:string | undefined}) {
	const post = props.post;
	const [cleanContent, setCleanContent] = useState<string>(post.content);
	const [templateTagArr, setTemplateTagArr] = useState<Array<{
				tag: string,
				index: number,
				tagText: string
			}>>();

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
					let linkText, linkLength, linkIndex;

					if (fullLink.match(/http:/)) {
						linkIndex = placeholder.indexOf('http://',editorLinks[i].index);
						linkLength = placeholder.substring(linkIndex, placeholder.indexOf('</span>',linkIndex)).length;
						linkText = placeholder.slice(linkIndex);
						linkText = linkText.slice(0, linkText.indexOf('</span>'))
						linkText = linkText.substring(7,30)+'...'
					} else {
						linkIndex = placeholder.indexOf('https://',editorLinks[i].index);
						linkLength = placeholder.substring(linkIndex, placeholder.indexOf('</span>',linkIndex)).length;
						linkText = placeholder.slice(linkIndex);
						linkText = linkText.slice(0, linkText.indexOf('</span>'))
						linkText = linkText.substring(8,30)+'...'
					}
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
		parseLinks(DOMPurify.sanitize(post.content));
	},[])

    return (
		<div>
			<div className='px-4 pb-4 pt-3'>
				{
					post.eventTitle &&
						<div className='text-2xl font-bold'><Link href={`/post/${post.id}`} title={post.eventTitle}>{post.eventTitle}</Link></div>
				}
				{
					post.eventDate &&
						<div className='mb-5 text-lg'>{formatDate(post.eventDate)}</div>
				}
				{ cleanContent && 
					<>
						<div>{parse(cleanContent)}</div>
						<div className='text-sm pt-2 italic text-gray-1'>{(post.edited) ? 'edited' : ''}</div>
					</>
				}
			</div>
			<PostMedia post={post}/>
			{templateTagArr && templateTagArr.length &&
				<PostTemplateTags templateTags={templateTagArr} googleMapsApiKey={props.googleMapsApiKey}/>
			}
		</div>
    )
}