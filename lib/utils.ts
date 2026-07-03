import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import User from "./models/user";
import SidebarProfile from "./models/sidebarProfile";
import UserDetails from "./models/userDetails";
import {getUserDetailsByHandleDAL} from '@/app/data/user'

export function cn(...inputs: ClassValue[]) {
  	return twMerge(clsx(inputs))
}

export const getRandomString = (length:number) => {
	const alphaNumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let dirName = '';

	for (let i = 0; i < length; i++) {
		const index = Math.floor(Math.random() * alphaNumeric.length);
		dirName += alphaNumeric.substring(index, index + 1)
	}

	return dirName;
}

export const formatDate = (date:Date | null | undefined):string => {
  	if (!date) return '';

	const months = [
		'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
	]

	const hours = (date.getHours() < 12 ) ? date.getHours() : date.getHours() - 12;
	const amPm = (date.getHours() < 12 ) ? 'AM' : 'PM';
	const minutes = (date.getMinutes().toString().length < 2 ) ? `${date.getMinutes().toString()}0` : date.getMinutes().toString();

	return `
		${months[date.getMonth()]} 
		${date.getDate()}, 
		${date.getFullYear()} 
		${hours}:${minutes}
		${amPm}
	`
}

export const compressImage = (file:File, maxWidth = 800, maxHeight = 600):Promise<string | undefined> => {
	return new Promise((resolve, reject) => {
		
		const quality = 0.7;
		const img = new Image();
		const reader = new FileReader();

		reader.onload = (ev:ProgressEvent<FileReader>) => {
			if (ev.target) {
				img.src = ev.target.result as string;
			}
		};

		reader.onerror = (err) => reject(err);
		reader.readAsDataURL(file);

		img.onload = () => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');

			if (img.height > img.width) {
				maxHeight = maxWidth;
				maxWidth = maxHeight;
			}

			const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
			canvas.width = img.width * ratio;
			canvas.height = img.height * ratio;

			if (ctx) {
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
				const compressedDataUrl = canvas.toDataURL('image/webp', quality);
				resolve(compressedDataUrl);
			} else {
				reject();
			}
		};
	});
}

const postTypeLabels: Record<string, string> = {
	post: 'Post',
	comment: 'Comment',
	event: 'Event'
}

export const getPostTypeLabel = (posttype?: string | null) => {
	if (!posttype) {
		return 'Post'
	}

	return postTypeLabels[posttype] || 'Post'
}

export const getProfileUserIdFromPath = (pathname:string) => {
	const match = pathname.match(/^\/user\/([^/]+)$/)

	return match ? match[1] : null
}

export const toSidebarProfile = (userdetails?:UserDetails | null): SidebarProfile | null => {
	if (!userdetails) {
		return null
	}

	return {
		id: userdetails.id,
		userid: userdetails.userid,
		handle: userdetails.handle,
		displayname: userdetails.displayname,
		avatar: userdetails.avatar,
		userdir: userdetails.userdir,
		followers: [],
		following: [],
		biohtml: userdetails.biohtml,
		biolexical: userdetails.biolexical,
		postcount: 0,
		followerscount: 0,
		followingcount: 0,
		urls: []
	}
}


export const subjects = [
	'clown', 'doctor', 'dancer', 'poet', 'painter', 'rock musician', 'punk musician', 'classical musician', 'hippie', 'yuppie', 'stoner','priest', 'priestess', 'fiction writer', 'film writer', 'politician', 'accident lawyer', 'AI chatbot'
];

export const objects = [
	'clown', 'monkey', 'llama', 'poet', 'cheeseburger', 'l.s.d tab', 'volcano', 'nose', 'hippie', 'yuppie', 'drug','hat', 'underwear', 'book', 'television', 'broken computer', 'spaceship', 'cow', 'guitar', 'piano', 'rainbow', 'personality', 'cell phone', 'hip waders'
];

export const adjectives = [
	'drunk', 'stoned', 'horny', 'angry', 'elegant', 'obnoxious', 'breezy', 'nebulous', 'moronic', 'sleepy', 'claustrophobic', 'arachnophobic', 'gothic', 'greasy', 'feverish', 'tripping', 'psychedelic', 'smokey', 'sublime', 'ecstatic', 'blind', 'deaf', 'clumsy', 'cordial', 'grotesque', 'dying', 'sad', 'melancholic', 'fat', 'colorful', 'rainbow', 'lying', 'bored', 'cynical', 'stubborn', 'satanic', 'weird', 'chaotic', 'passive-aggressive'
];

export const boringAdjectives = [
	'funny', 'weird', 'chaotic', 'passive-aggressive', 'poetic', 'dramatic', 'nostalgic', 'enthusiastic', 'deadpan', 'mysterious', 'caffeinated', 'cryptic', 'loud', 'riotous', 'valley girl', 'surfer', 'vampire', 'gothic'
];

export const parseText = (text:string):string => {
	const parsed = JSON.parse(text);

	let returnText = '';

	if (!parsed?.root?.children?.length) return '';

	for (const child of parsed.root.children) {
		for (const line of child.children) {
			if (line.trigger && line.trigger === '@') continue;
			returnText += line.text + ' ';
		}
	}

	return returnText;
}

export const randoLineCount = () => Math.floor(Math.random() * 10) + 5;

// Angle for .lvartsmusic-bg-gradient. Kept near vertical (0/180deg) rather than
// fully random 0-360: the visible background is usually a narrow strip (sidebar
// gutters), and angles near horizontal (90/270deg) barely change color across a
// narrow strip's width, making the gradient look like a single flat color.
export const getRandomGradientAngle = () => {
	const base = Math.random() < 0.5 ? 0 : 180;

	return base + Math.floor(Math.random() * 90 - 45);
}

export const shuffleArray = (array:Array<any>) => {
	for (let i = array.length - 1; i > 0; i--) {
		// Pick a random index from 0 to i
		const j = Math.floor(Math.random() * (i + 1));
		// Swap elements array[i] and array[j]
		[array[i], array[j]] = [array[j], array[i]];
	}

	return array;
}