import React, {useState} from 'react';

interface BubbleProps{
	id: number;
	value: string;
	height: string;
	width: string;
	top: number;
	left: number;
	onUpdateValue: (id: number, newValue: string) => void;
}

const Bubble: React.FC<BubbleProps> = ({ id, value, height, width, top, left, onUpdateValue}) => {
	
	const  [isEditing, setIsEditing] = useState(false);
	const [inputValue, setInputValue] = useState(value);
	
	const handleClick= (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsEditing(true);
	};
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);	
	}
	const handleBlur = () =>{
		setIsEditing(false)
		onUpdateValue(id, inputValue)
	}
	const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select(); // Highlight the text when input is focused
  };
  return( <div className="bubble" style={{height, width, backgroundColor: 'yellow', position: 'absolute', top, left}} 
    onClick={handleClick}
  >
	{isEditing ? (
		<input className="input" type="text" value={inputValue} onBlur={handleBlur} onChange={handleChange} autoFocus 
		onFocus = {handleFocus}/>
	) : (
		value
	)
  
  }
  </div>);
};

export default Bubble