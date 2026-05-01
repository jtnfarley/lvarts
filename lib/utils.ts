import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import User from "./models/user";
import SidebarProfile from "./models/sidebarProfile";

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
		
		const quality = 1;
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
				const compressedDataUrl = canvas.toDataURL('image/png', quality);
				resolve(compressedDataUrl);
			} else {
				reject();
			}
		};
	});
}

export const getProfileUserIdFromPath = (pathname:string) => {
	const match = pathname.match(/^\/user\/([^/]+)$/)

	return match ? match[1] : null
}

export const toSidebarProfile = (user:User): SidebarProfile | null => {
	if (!user.userDetails) {
		return null
	}

	return {
		userId: user.userDetails.userId,
		handle: user.userDetails.handle,
		displayName: user.userDetails.displayName,
		avatar: user.userDetails.avatar,
		userDir: user.userDetails.userDir,
		followers: user.userDetails.followers,
		following: user.userDetails.following,
		bio: user.userDetails.bio,
		postCount: user.userDetails.postCount || 0,
		urls: user.userDetails.urls || []
	}
}
