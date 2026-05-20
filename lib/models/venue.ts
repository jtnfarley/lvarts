export default interface Venue {
    id: number
    venuename: string
    address?: string | null
    cityid?: number | null
    stateid?: number | null
    zipcodeid?: number | null
}
