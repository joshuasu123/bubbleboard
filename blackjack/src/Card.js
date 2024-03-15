import './App.css';

export default Card

function Card(props)
{
	return <p className="card">{props.value}</p>
}