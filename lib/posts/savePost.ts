import { after } from 'next/server';
import { prisma } from '@/prisma';
import { pushPostActivity } from '@/lib/push';
import { notifyMentionedUsers } from '@/app/data/postMentions';

// Trusted: saves a post for whichever author the caller names, with NO authorization.
// Only server code that has already decided who the author is (the AI bots, the event
// importer, the guarded savePost action) may call this. It must never be exported from a
// 'use server' file, because every export of one is callable by any browser.
export const saveTrustedPost = async (postData:any) => {
    const {
        id,
        content, 
        lexical, 
        userdetailsid, 
        posttype, 
        postfile, 
        postfiletype, 
        isgalleryfile,
        parentPostId, 
        edited,
        eventname,
        eventdate,  
        privatepost, 
        venuename,
        address,
        trackname,
        artist,
        album,
        releaseyear,
        coverartfile,
        addToRadio
    } = postData

    let {venueid, eventid} = postData

    const date = new Date()
    const createdat = date
    const updatedat = date

    let posttypeid = 1;
    
    const postTypeQuery = await prisma.posttypes.findFirst({
        where: {
            posttype
        },
        select: {
            id: true
        }
    })

    if ((posttype && posttype === 'event') || (posttypeid && posttypeid === 3)) {
        if (!venueid && venuename) {
            const vid = await saveVenue({
                venuename,
                address
            });

            if (vid) {
                venueid = vid.id
            }
        }

        if (venueid) {
            eventid = await saveEvent({
                eventdate,
                eventname,
                venueid,
                eventid,
            })
        }
    }

    let postfiletypeid;
    if (postfile && postfiletype) {
        postfiletypeid = await prisma.filetypes.findFirst({
            where:{
                filetype: postfiletype
            }
        })
    }

    if (postTypeQuery?.id) posttypeid = postTypeQuery.id;

    const postDataCreate = {
        content,
        lexical: lexical ?? null,
        posttypeid,
        edited, 
        createdat,
        updatedat,
        privatepost,
        eventid: (eventid) ? eventid : null,
        postfiletypeid: (postfiletypeid?.id) ? postfiletypeid.id : null,
        postfile,
        isgalleryfile
    }

    let post;
    if (id) {
        post = await prisma.posts.update({
            where: {
                id
            },
            data: postDataCreate,
        })
    } else {
        post = await prisma.posts.create({
            data: postDataCreate,
        })
    }

    if (post && post.id) {
        await prisma.usertoposts.create({
            data: {
                postid: post.id,
                userdetailsid
            },
        })

        if (trackname && postfile) { //assume this is an audiotrack
            const audiotrack = await prisma.audiotracks.create({
                data: {
                    postid: post.id,
                    trackname,
                    album,
                    artist,
                    releaseyear: Number.parseInt(releaseyear),
                    coverartfile: coverartfile.name || undefined
                }
            })

            if (audiotrack?.id && addToRadio) {
                const azuracastid = await addToPlaylist(postfile);

                await prisma.audiotracks.update({
                data: {
                    azuracastid
                },
                where: {
                    id: audiotrack.id
                }
            })
            }
        }

        if (posttype === 'comment' && parentPostId) {
            await prisma.commentstopost.create({
                data: {
                    postid: Number.parseInt(parentPostId),
                    commentpostid: post.id
                }
            })

            await notifyParentPostAuthor(Number.parseInt(parentPostId), userdetailsid);
        }

        // A post waiting for review (e.g. a zine submission) stays quiet until it is public.
        if (!privatepost) {
            await notifyMentionedUsers({
                postid: post.id,
                authorUserDetailsId: userdetailsid,
                lexical
            })
        }
    }
    
    return post
}

const notifyParentPostAuthor = async (postid:number, senderuserdetailsid:number) => {
    const postAuthor = await prisma.$queryRaw<Array<{ userdetailsid: number }>>`
        select userdetailsid
        from usertoposts
        where postid = ${postid}
    `

    if (postAuthor && postAuthor.length) {
        const notificationid = await prisma.notifications.create({
            data: {
                notificationtypeid: 2,
                createdat: new Date(),
                postid
            }
        })

        if (notificationid && notificationid.id) {
            await prisma.userstonotifications.create({
                data: {
                    notificationid: notificationid.id,
                    senderuserdetailsid,
                    receiveruserdetailsid: postAuthor[0].userdetailsid
                }
            })

            after(() => pushPostActivity(postAuthor[0].userdetailsid, senderuserdetailsid, postid, 'commented on your post'))
        }
    }
}


const saveVenue = async (venueData:{venuename: string, address?: string}) => {
    const {venuename, address} = venueData;

    return await prisma.venues.create({
        data: {
            venuename, 
            address: address ?? null
        }
    })
}

const saveEvent = async (eventData:{eventname:string, eventdate:Date, venueid:number, eventid?:number}) => {
    const {eventdate, eventname, venueid} = eventData;

    let {eventid} = eventData;

    if (eventid) {
        await prisma.events.update({
            where: {
                id: eventid
            },
            data:{
                eventdate,
                eventname,
                venueid
            }
        })
    } else {
        const event = await prisma.events.create({
            data:{
                eventdate,
                eventname,
                venueid
            }
        })

        if (event) eventid = event.id;
    }

    return eventid;
}


const addToPlaylist = async (filename:string):Promise<number | undefined> => {
    //here we're adding the audio track to the playlist
    const files = await fetch('https://a6.asurahosting.com/api/station/614/files',{
        headers: {
            'Authorization': `Bearer ${process.env.AZURACAST_API_KEY}`
        }
    })
    .then(res => res.json())
    .then(res2 => res2)
    .catch(err => console.log(err));

    if (files.length) {
        
        const file = files.find((item:any) => item.path === filename.toLowerCase())

        if (!file?.playlists?.length) {
            file.playlists = [{id: 6820}];
            // PHP requires "length" as float; JSON.stringify drops the decimal for whole numbers
            const body = JSON.stringify(file).replace(/"length":(\d+)(?=[,}])/g, '"length":$1.0');
            
            await fetch(`https://a6.asurahosting.com/api/station/614/file/${file.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${process.env.AZURACAST_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body
            })
            .then(res => res.json())
            .then(res2 => res2)
            .catch(err => console.log(err));

            return file.id;
        }
    }

    return;
}

