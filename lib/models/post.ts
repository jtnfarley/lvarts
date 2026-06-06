export default interface Post {
    id: number
	content: string | null
	lexical?: string | null
	createdat: Date
    updatedat: Date
    edited: boolean | null
	posttype?: string | null
	postfile?: string | null
	isgalleryfile?: boolean | null
	filetype?: string | null
	postfiletypeid?: number | null
	posttypeid?: number | null
	privatepost?: boolean | null
	eventid?: number | null
	venueid?: number | null
	eventname?: string | null
	eventTitle?: string | null
	eventdate?: Date | null
	venuename?: string | null
	address?: string | null
	city?: string | null
	state?: string | null
	zipcode?: string | null
	headline?: string | null
	town?: string | null
	tags?: string | null
	likes?: number | null
	comments?: number | null
	userdetails?: {
		id: number
		userid: number
		displayname?: string | null
		userdir?: string | null
		avatar?: string | null
		handle?: string | null
		biohtml?: string | null
		biolexical?: string | null
	}
	parentPost?: {
		postid: number
		userid?: number
		userdetailsid?: number
		displayName?: string | null
	} | null
	venue?: {
		venuename?: string | null
		address?: string | null
		neighborhood?: string | null
	} | null
	parentPostId?: string | number
	posttypes?: {
		posttype?: string | null
	} | null
	filetypes?: {
		filetype?: string | null
	} | null
	events?: {
		id?: number
		eventname?: string | null
		eventdate?: Date | null
		venueid?: number | null
		venues?: {
			venuename?: string | null
			address?: string | null
		} | null
	} | null
	venues?: {
		venuename?: string | null
		address?: string | null
	} | null
}
