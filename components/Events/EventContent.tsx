'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import createDOMPurify from 'dompurify';
import PostTemplateTags from '../PostUi/PostTemplateTags';
import { FeedRow } from '@/lib/models/initFeedRow';
import imageUrl from '@/constants/imageUrl';

// Eastern time matches formatDate in lib/utils.ts and avoids server/browser timezone mismatches.
const eventMonthFormat = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', month: 'short' });
const eventDayFormat = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', day: 'numeric' });
const eventTimeFormat = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', hour12: true });

export default function EventContent(props:{post:FeedRow, googleMapsApiKey:string | undefined}) {
    const post = props.post;
	const [cleanContent, setCleanContent] = useState<string>(post.content || '');
	const [templateTagArr, setTemplateTagArr] = useState<Array<{
				tag: string,
				index: number,
				tagText: string
			}>>();
    const displayTitle = post.eventname
    // const postTags = splitPostTags(post.tags)
    const venuename = post.venuename
    const address = post.address
	const imageFile = (post.postfile) ? imageUrl+"/"+post.userdetails!.userdir+"/"+post.postfile : undefined;

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
					linkText = linkText.substring((fullLink.match(/http:/)) ? 7 : 8,50)+'...'

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

	const eventMonth = post.eventdate && eventMonthFormat.format(post.eventdate).toUpperCase();
	const eventDay = post.eventdate && eventDayFormat.format(post.eventdate);
	const eventTime = post.eventdate && eventTimeFormat.format(post.eventdate);

    return (
		<div className='flex h-full flex-col'>
			<div className='relative aspect-[4/3] w-full overflow-hidden bg-black'>
				{imageFile ?
					<img src={imageFile} alt='' className='h-full w-full object-cover'/>
					:
					<div className='flex h-full w-full items-center justify-center p-8'>
						<img src='/logos/map-trans.png' alt='' className='max-h-full max-w-full object-contain opacity-80'/>
					</div>
				}
				{post.eventdate &&
					<div className='absolute left-0 top-0 flex w-12 flex-col items-center bg-lvartsmusic-accent-highlight py-1.5 font-black leading-none text-black'>
						<span className='text-[10px] tracking-wider'>{eventMonth}</span>
						<span className='mt-1 text-2xl'>{eventDay}</span>
					</div>
				}
			</div>

			<div className='flex flex-1 flex-col gap-3 p-4'>
				{venuename &&
					<div className='text-xs font-semibold uppercase tracking-wider text-lvartsmusic-muted'>
						{venuename}
						{address && <> · <a href={getMapLink(address)} target='_blank' className='normal-case text-blue-600 dark:text-blue-400'>Map</a></>}
					</div>
				}
				{displayTitle &&
					<div className='text-lg font-bold leading-snug'>
						<Link href={`/post/${post.id}`} title={displayTitle}>{displayTitle}</Link>
					</div>
				}
				{eventTime &&
					<div className='w-fit rounded-full bg-black/5 px-3 py-1 text-xs dark:bg-white/10'>
						🕒 {eventTime}
					</div>
				}
				{cleanContent &&
					<div className='text-sm font-normal'>{parse(cleanContent)}</div>
				}
				{templateTagArr && templateTagArr.length > 0 &&
					<PostTemplateTags templateTags={templateTagArr} googleMapsApiKey={props.googleMapsApiKey}/>
				}
			</div>
		</div>
    )
}
