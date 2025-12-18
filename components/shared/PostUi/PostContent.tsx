'use client'

import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import Post from '@/lib/models/post';

export default function PostContent(props:{postData:Post}) {

	const parseLinks = (post:string):string => {
		let placeholder = post;
		const editorLinks = [...post.matchAll(/editor-link/g)];

		if (editorLinks && editorLinks.length) {
			for(let i = 0; i < editorLinks.length; i++) {
				const indexA = placeholder.indexOf('<a');
				const fullLink = placeholder.substring(indexA, placeholder.indexOf('</a>', indexA) + 4)
				if (fullLink.match(/giphy/)) {
					placeholder = placeholder.slice(0, indexA)
				} else {
					placeholder = placeholder.slice(0, placeholder.indexOf('>',editorLinks[i].index)) + " target='_blank'" + placeholder.slice(placeholder.indexOf('>',editorLinks[i].index)) 
				}
			}

			post = placeholder;
		}

		post = parseTags(post);

		return post;
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

    return (
		<div className='px-4 pb-4 pt-3'>
			<div>{parse(parseLinks(DOMPurify.sanitize(props.postData.content)))}</div>
			<div className='text-sm pt-2 italic text-gray-1'>{(props.postData.edited) ? 'edited' : ''}</div>
		</div>
		
    )
}