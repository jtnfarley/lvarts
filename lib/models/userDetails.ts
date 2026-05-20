export default interface UserDetails {
	id: number
	userid: number
	handle?: string | null
	biolexical?: string | null
	biohtml?: string | null
	createdat: Date
	displayname?: string | null
	userdir?: string | null
	avatar?: string | null
	suspended?: boolean | null
	updatedat?: Date | null
}
