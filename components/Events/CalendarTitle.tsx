'use client'

import { Major_Mono_Display  } from 'next/font/google'
import { useEffect, useState } from 'react'

const fascinate = Major_Mono_Display({
  	weight: "400",
	subsets: []
})

const adjectives = [
	'potAble',
	'portAble',
	'unpretentious ',
	'foldAble',
	'forMidAble',
	'fAtuous',
	'collApsible',
	'trAnslucent',
	'corruptible',
	'unMitiGAted',
	'coMplete And unAbridGed',
	'sAtisfAction GuArAnteed',
	'3 bedrooM/2 bAth',
	'flyinG',
	'Mobile',
	'MechAnically-sepArAted',
	'fortified',
	'fortified with riboflAvin',
	'subconscious',
	"finger lickin' Good",
	'subterrAneAn',
	'fAt free',
	'subliMinAl',
	'pAint-by-nuMbers',
	'Mostly hArMless',
	'compostAble',
	'85% leAn',
	'choose your own Adventure',
	'plAstic fAntAstic',
	'provocAtive',
	'MAsticAted',
	'undigested',
	'edible',
	'hAbit-forMing'
]

export default function CalendarTitle() {
	const [adjective, setAdjective] = useState<string>('')

	useEffect(() => {
		setAdjective(adjectives[Math.floor(Math.random() * adjectives.length)])
	},[])

	return (
		<div>
		{adjective !== '' &&
			<div className={`text-xl text-gray-900 bg-white/60 p-5 shadow-xl rounded-lg w-full lg:text-5xl`}>
				<div className="text-lg lg:text-3xl">Lehigh Valley</div><div className={fascinate.className}>Art & Music events</div>
			</div>
		}
		</div>
	);
}
