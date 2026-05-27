'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import createDOMPurify from 'dompurify';
import PostTemplateTags from '../PostUi/PostTemplateTags';
import { FeedRow } from '@/lib/models/initFeedRow';
import imageUrl from '@/constants/imageUrl';

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

    return (
		<div>
			<div className='flex'>
				<div className='h-50 w-full max-w-50' style={{ 
					background: (imageFile) ? `url(${imageFile})` : '#111', 
					backgroundPosition: 'center',
					backgroundSize: '300px 300px',
					backgroundRepeat: 'no-repeat'
				}}>
					{
						post.eventdate &&
							<div className='mb-5 px-3 text-white h-full w-full backdrop-blur-xs flex flex-col justify-center items-center text-5xl font-black'>
								{post.eventdate.getDate()}
								<div className='text-lg mt-3 font-normal'>{(post.eventdate.getHours() > 12) ? post.eventdate.getHours() - 12 : post.eventdate.getHours()}:{(post.eventdate.getMinutes().toString().length < 2) ? `0${post.eventdate.getMinutes()}` : post.eventdate.getMinutes()}</div>
							</div>
					}
				</div>
				{
					displayTitle &&
						<div className='text-xl font-bold p-5 flex-1'>
							<div className='mb-5'><Link href={`/post/${post.id}`} title={displayTitle}>{displayTitle}</Link></div>
							{ cleanContent && 
								<div className='font-normal text-sm'>
									<div>{parse(cleanContent)}</div>
								</div>
							}
						</div>
				}
				{
					(venuename || address) &&
						<div className='mb-4 rounded-2xl bg-gray-50 px-4 py-3 text-gray-700 flex justify-center items-center max-w-50'>
							<div className='flex flex-col gap-x-4 gap-y-1 items-center'>
								{venuename && <div className='text-center'><strong>@ {venuename}</strong></div>}
								{address && <div><strong><a href={getMapLink(address)} target='_blank' className='text-blue-600 text-sm'>Map</a></strong></div>}
							</div>
						</div>
				}
			</div>

			{templateTagArr && templateTagArr.length &&
				<PostTemplateTags templateTags={templateTagArr} googleMapsApiKey={props.googleMapsApiKey}/>
			}
		</div>
    )
}
