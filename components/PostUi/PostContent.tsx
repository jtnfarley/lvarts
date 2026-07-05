'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import createDOMPurify from 'dompurify';
import PostMedia from './PostMedia';
import PostTemplateTags from './PostTemplateTags';
import { formatDate } from '@/lib/utils';
import { FeedRow } from '@/lib/models/initFeedRow';
import imageUrl from '@/constants/imageUrl';
import Image from 'next/image';

export default function PostContent(props:{post:FeedRow, googleMapsApiKey:string | undefined}) {
    const post = props.post;
	const [cleanContent, setCleanContent] = useState<string>(post.content || '');
	const [templateTagArr, setTemplateTagArr] = useState<Array<{
				tag: string,
				index: number,
				tagText: string
			}>>();
    const displayTitle = post.eventname;
    const venuename = post.venuename;
    const address = post.address;
	const trackname = post.audio.trackname;
	const artist = post.audio.artist;
	const album = post.audio.album;
	const releaseyear = post.audio.releaseyear;
	const coverartfile = (post.audio.coverartfile) ? `${imageUrl}/${post.userdetails!.userdir}/${post.audio.coverartfile}` : null;

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
					linkText = placeholder.substring(linkIndex, linkEnd)
					linkText = linkText.replace(/^https?:\/\//, '');
					linkText = linkText.length > 50 ? linkText.substring(0, 50)+'...' : linkText;
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

	const getMapLink = (address:string):string => {
		return `https://www.google.com/maps/place/${address.replaceAll(' ', '+')}`;
	}

	useEffect(() => {
		parseLinks(createDOMPurify(window).sanitize(post.content || ''));
	},[])

    return (
		<div>
			<div className='postContent text-lvartsmusic-foreground'>
				{
					displayTitle &&
						<div className='text-lg font-bold text-lvartsmusic-foreground'><Link href={`/post/${post.id}`} title={displayTitle}>{displayTitle}</Link></div>
				}
				{
					post.eventdate &&
						<div className='mb-3 text-sm text-lvartsmusic-muted'>{formatDate(post.eventdate)}</div>
				}

				{
					(venuename || address) &&
						<div className='mb-3 rounded-2xl bg-black/5 dark:bg-white/5 px-4 py-3 text-sm text-lvartsmusic-foreground'>
							<div className='flex flex-col gap-x-4 gap-y-1'>
								{venuename && <div className='text-base'>At <strong>{venuename}</strong></div>}
								{address && <div><strong><a href={getMapLink(address)} target='_blank' className='text-lvartsmusic-accent'>Map</a></strong></div>}
							</div>
						</div>
				}

				{
					(trackname && post.postfile) &&
						<div className='mb-3 rounded-2xl bg-black/5 dark:bg-white/5 px-4 py-3 text-sm text-lvartsmusic-foreground'>
							<div className='flex gap-x-4 gap-y-1'>
								{coverartfile &&
									<div>
										<Image src={coverartfile} alt={`${trackname} by ${artist}`} width={150} height={150} />
									</div>
								}
								<div>
									<div className='text-base'><strong>{trackname}</strong></div>
									{artist && <div>{artist}</div>}
									{album && <div>{album}</div>}
									{releaseyear && <div>{releaseyear}</div>}
								</div>
							</div>
						</div>
				}

				{ cleanContent &&
					<div>
						<div>{parse(cleanContent)}</div>
						<div className='mt-1 flex justify-end gap-2 text-xs text-lvartsmusic-muted'>
							{post.edited && <span className='italic'>edited</span>}
							<span>{post.createdat.toDateString()}</span>
						</div>
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
