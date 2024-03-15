import './App.css';
import React from "react"
import ReactDOM from 'react-dom/client';
import Card from "./Card"

function App() {
	const [deck, setDeck] = React.useState(newDeck());
	const [dealerHand, setDealerHand] = React.useState([]);
	const [playerHand, setPlayerHand] = React.useState([]);
	const [dealerTotal, setDealerTotal] = React.useState(0);
	const [playerTotal, setPlayerTotal] = React.useState(0);
	const [gameStatus, setGameStatus] = React.useState(0); //0 - game hasn't started; 1- player's turn; 2 -dealer's turn
	const [money, setMoney] = React.useState(1000);
	const [wager, setWager] = React.useState(50);
	let dealerAces= 0;
	let playerAces= 0;
	
	
	const [outcome, setOutcome] = React.useState("Make your wager")
	
	function reset(){
		setDeck(newDeck());
		setDealerHand([]);
		setPlayerHand([]);
		setPlayerTotal(0);
		setDealerTotal(0);
		setDeck(newDeck());
		
		setPlayerTotal(() => {
        return 0;
    });
		
		dealerAces = playerAces = 0;
	}
	
	function newDeck(){
		const arr = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A",
		2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A",
		2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A",
		2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"]
		
		shuffleArray(arr);
		return arr;
	}
	function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    
}
	function dealDealer(){
		//draw card and eliminate it from deck
		//add it to dealerHand
		let x = drawCard();
		console.log(dealerHand)
		
		let c = x;
		if(x==="J" || x==="Q" || x=== "K"){
			c = 10;
		}
		if(x==="A"){
			c=11;
			dealerAces++;
		}
		
		// Update the dealer's total
   		 setDealerTotal(prevTotal => prevTotal + c);

    // Add the card to dealerHand
    	setDealerHand(prevHand => [...prevHand, <Card className="child" value={x}/>]);
    	return c;
	}
	function dealPlayer(){
		console.log("deal player")
		let x = drawCard();
		//let newPlayerHand = [...playerHand, <Card className="child" value={x}/>];
  		//setPlayerHand(newPlayerHand);
		setPlayerHand(prevPlayerHand => {
        let newPlayerHand = [...prevPlayerHand, <Card className="child" value={x}/>];
        return newPlayerHand;
    });
    	
		
		
		let c = x;
		if(x==="J" || x==="Q" || x=== "K"){
			c = 10;
		}
		if(x==="A"){
			c=11;
			playerAces++;
		}
		setPlayerTotal(prevPlayerTotal => {
        let newTotal = prevPlayerTotal + c;
        // You can perform any logic here that depends on the previous playerTotal state
        if (newTotal > 21 && playerAces > 0) {
            playerAces--;
            newTotal -= 10; // Adjust total if player has Aces and exceeds 21
        } else if (newTotal > 21) {
            setOutcome("Bust!");
        }
        return newTotal;
    });
		
	}
	function drawCard(){
		const v = deck.shift();
		setDeck(deck);
		//console.log(v);
		return v
	}
	//deal the player two cards and the dealer one
	function startGame(){
		if(wager>money){
			setOutcome("Not enough money")
			return;
		}
		reset();
		setGameStatus(1);	
		 dealPlayer();
   		 dealDealer();
	}
	function stand(){
		setGameStatus(2);
		setOutcome("Click Continue")
	}
	async function executeDealerTurn(){
			await dealUntilTotalGreater16()
			
	}
	async function dealUntilTotalGreater16() {
    	let localDealerTotal = dealerTotal;
    	while (localDealerTotal <= 16) {
       	 localDealerTotal += dealDealer();
       	 if(localDealerTotal >21 && dealerAces>0){
        	dealerAces--;
        	localDealerTotal -= 10;
        	setDealerTotal(localDealerTotal)
        	
        }
        await new Promise(resolve => setTimeout(resolve, 500)); // Allow event loop to continue
        
    }
	}
	function resolveHand(){
			//check for blackjack
			if(playerHand.length ===2 && playerTotal ===21)
				{
						
					setOutcome("Blackjack!")
					setMoney(prevMoney => prevMoney + (wager*2))			
				}
			else if(playerTotal>21){
				setOutcome("Player Busted")
				setMoney(prevMoney => prevMoney - wager)
			}
			else if(dealerTotal>21){
				setOutcome("Dealer Busted")
				setMoney(prevMoney => prevMoney + wager)
			}
			else if(dealerTotal<playerTotal){
				
				
				setOutcome("Player Wins")
				setMoney(prevMoney => prevMoney + wager)
				
			}
			else if(dealerTotal>playerTotal){
				setOutcome("Player Loses")
				setMoney(prevMoney => prevMoney - wager)
			}
			else{
				setOutcome("Push")
			}
		setGameStatus(4);
	}
	function incrementWager(){
		if(wager+50> money){
			return
		}
		setWager(prevWager=> prevWager +50)
	}
	function decrementWager(){
		if(wager <= 50){
			return
		}
		setWager(prevWager=> prevWager - 50)
	}
	function doubleDown(){
		dealPlayer();
		setWager(prevWager=> 2 * prevWager);
		stand();
	}
	React.useEffect(() => {
	if (gameStatus === 1 ){
		setOutcome("Player's option")
	}
    if (gameStatus === 2) {
        setGameStatus(3); // Update game status to prevent infinite loop
        executeDealerTurn();
		
    }
}, [gameStatus]);

React.useEffect(() => {
    // This effect runs every time playerHand changes
    console.log("Player hand updated:", playerTotal);
}, [playerTotal][playerHand]);



	
	/*let dealerElements;
	React.useEffect(() => {
	dealerElements = dealerHand.map(v => <Card value={v}/>);
	console.log("rendering")
	
	}, [dealerHand]
	)*/
	
  return (
    <div className="App">
      <header className="App-header">
      	<div>{outcome}</div>
        <div className = "dealer-box">
        	<div className="card-container">
			{dealerHand}
			</div>
			<p>
			{dealerTotal}
			</p>
        </div>
        {gameStatus === 0 && (<button className="game-option" onClick={startGame}>Start game</button>)}
        {gameStatus=== 1 && playerTotal<22 && (<button className="game-option" onClick={dealPlayer}>Hit</button>)}
        {gameStatus ===1 && (<button className="game-option" onClick={stand}>Stand</button>)}
        {gameStatus=== 1 && playerTotal<22 && playerHand.length===2 && (<button className="game-option" onClick={doubleDown}>Double Down</button>)}
        {gameStatus ===3 && (<button className="game-option" onClick={resolveHand}>Continue</button>)}
        <div className = "player-box">
        	<div className="card-container">
			{playerHand}
			</div>
			<p>
			{playerTotal}
			</p>
        </div>
            <div>
    			Total Money: ${money}
    		</div>
       {gameStatus === 4 && (<button onClick = {startGame}>Next Hand</button>)}
       <div class="container">
    <div class="circle">
        {(gameStatus === 4 || gameStatus ===0) &&(<div class="button plus" onClick={incrementWager}>+</div>)}
        {(gameStatus === 4 || gameStatus ===0) &&(<div class="button minus" onClick={decrementWager}>-</div>)}
        <span>${wager}</span>
    </div>

</div>
      </header>
    </div>
  );
}
export default App;
