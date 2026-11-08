export const deleteFromPlaylist = async (azuracastid: bigint) => {
    await fetch(`https://a6.asurahosting.com/api/station/614/file/${azuracastid}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${process.env.AZURACAST_API_KEY}`,
            'Content-Type': 'application/json'
        }
    })
}
