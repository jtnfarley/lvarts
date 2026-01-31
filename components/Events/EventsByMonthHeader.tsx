export default function EventsByMonthHeader(props:{month:string, year:string, forward:Function, back:Function}) {
	const month = props.month;
	const year = props.year;
	const back = props.back;
	const forward = props.forward;
	
    return (
		<div className='text-2xl font-bold my-3 flex'>
			<div className='me-5 cursor-pointer' onClick={() => back()}>{`<`}</div>
			<div>{month} {year}</div>
			<div className='ms-5 cursor-pointer' onClick={() => forward()}>{`>`}</div>
		</div>			
    )
}
