import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { saveGameToCloud, loadGamesFromCloud } from './TcaCloudApi';


export interface player {
  name: string;
  order: number;
}

export interface gameResult {
  start: string;      // "2022-02-14T18:49:30"
  end: string;        // "2022-02-14T18:59:30"
  winner: string      // "Me"
  players: player[]   

  // tca-zombie-specific
  expansions?: any[]
  gameTurns?: any[];
}

export interface currentGame {
  start: string;
  players: string[];
}

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(
    private storage: StorageMap
  ) { }

  gameResults: gameResult[] = [];

  addGameResult = async (r: gameResult) => {
    this.gameResults = [
      ...this.gameResults
      , r
    ];

    await saveGameToCloud(
      this.emailAddress
      , "tca-foo-angular-md"
      , r.end
      , r
    );
  };

  getUniquePlayers = () => (
    [...new Set(this.gameResults.flatMap(x => x.players.map(y => y.name)))]
  );

  currentGame: currentGame = {
    start: ""
    , players: []
  };

  setCurrentGame = (g: currentGame) => {
    this.currentGame = g;
  };

  calculateShortestGame = () => (
    Math.min(
        ...this.gameResults.map(x => Date.parse(x.end) - Date.parse(x.start))
    )
  );

  calculateLeaderBoard = () => {

    return this.getUniquePlayers().map(x => {
  
      const gamesThisPlayerHasPlayed = this.gameResults.filter(y => y.players.some(z => z.name === x));
      const gamesThisPlayerHasWon = gamesThisPlayerHasPlayed.filter(y => y.winner === x);
  
      return {
        name: x
        , wins: gamesThisPlayerHasWon.length
        , losses: gamesThisPlayerHasPlayed.length - gamesThisPlayerHasWon.length
        , winningPercentage: (gamesThisPlayerHasWon.length / gamesThisPlayerHasPlayed.length).toFixed(3)
      };
    }).sort(
      (a, b) => a.winningPercentage > b.winningPercentage ? -1 : 1
    );
  };

  loadGameResults = async () => {
    const data = await loadGamesFromCloud(
      this.emailAddress
      , "tca-foo-angular-md"
    );
    this.gameResults = data as any[] ?? [];
  };

  emailAddress = "";
  
  saveEmailAddress = (newEmailAddress: string) => {
    this.storage.set('emailAddress', newEmailAddress).subscribe();
  };

  loadEmailAddresss = async () => {
    this.emailAddress = await this.storage.get("emailAddress").toPromise() as string ?? "";
  };
}
