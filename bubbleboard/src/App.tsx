import React, {useState, useEffect} from 'react';

import logo from './logo.svg';
import './App.css';
import Bubble from './bubble'
import Line from './line'
import axios from 'axios';
import AWS from 'aws-sdk';

interface BubbleData {
  id: number;
  value: string;
  height: string;
  width: string;
  top: number;
  left: number;
} 
interface LineData{
	id: number
	startX: number;
	startY: number;
	endX: number;
	endY: number;
}

AWS.config.update({
  region: 'us-east-2', // Your region
  accessKeyId: 'AKIAQEIP3BPRUZVOMX5S',
  secretAccessKey: 'M2wYgfdvJchft/SGljYlrcDC0K76YAuE/m6LiTZV'
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

type MyTuple = [BubbleData[], LineData[]];
type MyMap = Map<string, MyTuple>;

const App: React.FC = () => {
	
	
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const [lines, setLines] = useState<LineData[]>([]);
  const [nextLineId, setNextLineId] = useState(1);
  const [nextId, setNextId] = useState(1);
  const [mode, setMode] = useState(0);
  const [lineX, setLineX] = useState(0);
  const [lineY, setLineY] = useState(0);
  const [entries, setEntries] = useState<string[]>(["Untitled#1"]);
  const [currentBoard, setCurrentBoard] = useState<string>("Untitled#1")
  const [nameInput, setNameInput] = useState("");
  const [myMap, setMyMap] = useState<MyMap>(new Map());
  const [deletedBoards, setDeletedBoards] = useState<string[]>([]);
  

	interface SerializedMap {
    [key: string]: MyTuple;
  }


  const saveToDynamoDB = async () => {
	    
	    for (const boardName of deletedBoards) {
		    const deleteParams = {
		      TableName: 'BubbleBoard',
		      Key: {
		        BoardName: boardName,
		      },
		    };
		
	    try {
	      await dynamoDB.delete(deleteParams).promise();
	      console.log(`Board ${boardName} deleted successfully!`);
	    } catch (error) {
	      console.error(`Error deleting board ${boardName}:`, error);
	    }
	  }
	
	  // Reset deleted boards after processing
	  setDeletedBoards([]);
	    
	    
	    const serializedMap: SerializedMap = Array.from(myMap.entries()).reduce((obj, [key, value]) => {
	      obj[key] = value;
	      return obj;
	    }, {} as SerializedMap);
	
	    const params = {
	      TableName: 'BubbleBoard',
	      Item: {
	        BoardName: 'all_boards',
	        Boards: serializedMap
	      }
	    };
	
	    try {
	      await dynamoDB.put(params).promise();
	      console.log("All boards successfully written!");
	    } catch (error) {
	      console.error("Error writing document: ", error);
	    }
	  };
	
  const loadFromDynamoDB = async (): Promise<MyMap> => {
	  const params = {
	    TableName: 'BubbleBoard',
	  };
	
	  try {
	    const data = await dynamoDB.scan(params).promise();
	    //console.log(data);
	    if (data.Items) {
	      const boardsMap = new Map<string, MyTuple>();
	
	      // Loop through each item in data.Items
	      data.Items.forEach((item: any) => {
	        // Assuming each item is an entry with BoardName and Boards
	        const boardName = item.BoardName.S;
	
	        // Now loop through each key in Boards (like 'hahayes' and 'i don't care')
	        Object.keys(item.Boards).forEach((actualBoardName) => {
	          const boardData = item.Boards[actualBoardName];
	
	          // Assuming the first array is bubbles and the second is lines
	          const bubbles = boardData[0].map((b: any) => ({
	            id: b.id,
	            value: b.value,
	            height: b.height,
	            width: b.width,
	            top: b.top,
	            left: b.left,
	          }));
	
	          const lines = boardData[1].map((l: any) => ({
	            id: l.id,
	            startX: l.startX,
	            startY: l.startY,
	            endX: l.endX,
	            endY: l.endY,
	          }));
	
	          // Add to boardsMap
	          boardsMap.set(actualBoardName as string, [bubbles as BubbleData[], lines as LineData[]]);
	        });
	      });
	
	      return boardsMap;
	    } else {
	      console.log("No items found!");
	      return new Map();
	    }
	  } catch (error) {
	    console.error("Error getting documents: ", error);
	    return new Map();
	  }
};

	
	
  const save = () => {
	
	console.log("save button");
	setMyMap((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(currentBoard, [bubbles, lines]);
      return newMap;
    });
    /*
    const data = {
      [currentBoard]: {
        bubbles,
        lines
      }
    };

    axios.post('http://localhost:3001/update-data', data)
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error('There was an error updating the data!', error);
      });
      */
  };

  
  const handleNameChange=  (e: React.ChangeEvent<HTMLInputElement>) => {
		setNameInput(e.target.value);	
	}
const renameBoard = () => {
		let oldName = currentBoard
		//copy values from old to new
		setEntries(prevEntries => {return [...prevEntries.filter(entry => entry !== oldName), nameInput];});
		setCurrentBoard(nameInput);
		setMyMap(oldMap => {
		    const newMap = new Map(oldMap);
		    const boardData = newMap.get(oldName);
		    if (boardData) {
		      newMap.delete(oldName); // Remove the old board name
		      newMap.set(nameInput, boardData); // Set the new board name with the same data
		    }
		    return newMap;
		 });
		
	}

  const setBoard = (e: React.MouseEvent<HTMLLIElement>, entry: string) => {
		e.stopPropagation();
		setCurrentBoard(entry);
		const boardData = myMap.get(entry);
		if (boardData){
			setBubbles(boardData[0]);
			setLines(boardData[1]);
			}
		else{
			setBubbles([]);
			setLines([]);
		}
		
  }
  const removeBoard  = (entryToRemove: string) => {
		
		setEntries(prevEntries => prevEntries.filter(entry => entry !== entryToRemove));
		setDeletedBoards([...deletedBoards, entryToRemove]);
		myMap.delete(entryToRemove)
  }
  const newBoard = () => {
	let n = Math.floor(Math.random() *1000)
	setEntries((prevEntries) => [...prevEntries, `Untitled Board#${n}`])
  }
  const onUpdateValue = (id: number, newValue: string) => {
    setBubbles((prevBubbles) =>
      prevBubbles.map((bubble) =>
        bubble.id === id ? { ...bubble, value: newValue } : bubble
      )
    );
  };
	
  const addObject = (e: React.MouseEvent<HTMLDivElement>) => {
		
		if (mode === 0)
		{
			addBubble(e)
		}
		else if (mode === 1)
		{
			startLine(e)
			setMode(2)
		}
		else if (mode === 2)
		{
			endLine(e)
			setMode(1)
		}
	}
	const deleteObject = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (mode === 0 )
		{
			if (nextId > 1){
				let undone = bubbles
				undone.pop()
				setBubbles(undone);
				setNextId(nextId-1)
			}
		}
		else{
			if (nextLineId > 1){
				let undone = lines
				undone.pop()
				setLines(undone);
				setNextLineId(nextLineId-1)
			}
		}
  }
	

  const addBubble = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const newBubble: BubbleData = {
      id: nextId,
      value: `Bubble ${nextId}`,
      height: '100px',
      width: '160px',
      top: e.clientY - rect.top,
      left: e.clientX - rect.left +rect.width*.1,
    };
    setBubbles((prevBubbles) => [...prevBubbles, newBubble]);
    setNextId(nextId + 1);
  };
  const switchToLine = (e: React.MouseEvent) => {
		e.stopPropagation();
		setMode(1);
  }
  const switchToBubble = (e: React.MouseEvent) => {
		e.stopPropagation();
		setMode(0);
  }
  const startLine = (e: React.MouseEvent<HTMLDivElement>) =>{
	const rect = e.currentTarget.getBoundingClientRect();
	setLineX(e.clientX - rect.left + rect.width *.1)
	setLineY(e.clientY - rect.top)
  }
  const endLine = (e: React.MouseEvent<HTMLDivElement>) =>{
	const rect = e.currentTarget.getBoundingClientRect();
	const X2 = e.clientX - rect.left + rect.width *.1
	const Y2 = e.clientY - rect.top
	const newLine: LineData = {
      id: nextLineId,
      startX: lineX,
		startY: lineY,
		endX: X2,
		endY: Y2,
    };
    setLines((prevLines) => [...prevLines, newLine]);
    setNextLineId(nextLineId+1)
    }
    
   useEffect(() => {
    const fetchInitialData = async () => {
      const initialMap = await loadFromDynamoDB();
      setMyMap(initialMap);
	console.log(initialMap);
	const ents = [...initialMap.keys()]
		setEntries(ents)
      // Set the initial board to display
      setCurrentBoard(ents[0])
      const initialBoardData = initialMap.get(ents[0]);
      if (initialBoardData) {
        setBubbles(initialBoardData[0]);
        setLines(initialBoardData[1]);
      }
    };

    fetchInitialData();
  }, []); // Empty dependency array, runs only once when the component mounts
  
  useEffect(() => {
	setNameInput(currentBoard);
  }, [currentBoard]);

 
  return (
	<body className='body'>
		<div className='left-panel'>
			<ul className="entry-list">
                {entries.map((entry: string, index: number) => (
                    <li key={index}
                    onClick={(event)=> {event.stopPropagation(); setBoard(event, entry)}} className={entry === currentBoard ? 'green-entry-item':'entry-item'}>{entry}
                    	<button className="xbutton" onClick={(event)=> {event.stopPropagation(); removeBoard(entry)}}>X</button>
                    </li>
                ))}
            </ul>
            <button className="button" onClick={(event)=> {event.stopPropagation(); save()}}>
            	Save
            </button>
            <button className="button" onClick={(event)=> {event.stopPropagation(); newBoard()}}>
            	New Board
            </button>
            <button className="button" onClick={(event)=> {event.stopPropagation(); saveToDynamoDB()}}>
            	Save to Database
            </button>
		</div>
	    <div className="main-content" id="svgContainer" onClick={addObject} 
	    onContextMenu={(e) => {
	        e.preventDefault();
	        // Handle the right-click event here
	        console.log('Right-click detected');
	      }}
	    >
	    	<input className="rename-field" onClick={(event)=> {event.stopPropagation();}} onBlur={renameBoard} onChange={handleNameChange} value={nameInput}></input>
	      {bubbles.map((bubble) => (
	        <Bubble
	          key={bubble.id}
	          id={bubble.id}
	          value={bubble.value}
	          height={bubble.height}
	          width={bubble.width}
	          top={bubble.top}
	          left={bubble.left}
	          onUpdateValue={onUpdateValue}
	        />
	      ))}
	      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
	        {lines.map((line) => (
	          <Line
	            key={line.id}
	            id={line.id}
	            startX={line.startX}
	            startY={line.startY}
	            endX={line.endX}
	            endY={line.endY}
	          />
	        ))}
	      </svg>
	      <div style={{position: 'absolute', bottom: 0}}>
	      	<button onClick={switchToLine} className={mode > 0 ? 'green-button button' : 'button'}>
	      		Line
	      	</button>
	      	<button onClick={switchToBubble} className={mode === 0 ? 'green-button button' : 'button'}>
	      		Bubble
	      	</button>
	      	<button onClick={deleteObject} className='button'>
	      		Undo
	      	</button>
	      </div>
	    </div>
    </body>
  );
};

export default App;