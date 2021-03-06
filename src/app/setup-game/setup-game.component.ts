import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../game.service';

interface choosePlayerItem {
  name: string;
  checked: boolean;
}
@Component({
  selector: 'app-setup-game',
  templateUrl: './setup-game.component.html',
  styleUrls: ['./setup-game.component.css']
})
export class SetupGameComponent implements OnInit {

  constructor(
    private gameSvc: GameService
    , private routerSvc: Router
  ) { }

  availablePlayers: choosePlayerItem[] = [];

  ngOnInit(): void {
    this.availablePlayers = this.gameSvc.getUniquePlayers().map(x => ({
      name: x
      , checked: false
    }));
  }

  startGame = () => {

    // Save players and start timestamp in service.
    this.gameSvc.setCurrentGame({
      start: new Date().toISOString()
      , players: this.availablePlayers.filter(x => x.checked).map(x => x.name)
    });

    // Navigate to play screen.
    this.routerSvc.navigateByUrl("/play");
  };

  newPlayerName = "";

  addNewPlayer = () => {
    this.availablePlayers = [
      ...this.availablePlayers
      , {
        name: this.newPlayerName
        , checked: true
      }
    ];

    this.newPlayerName = "";
  };
}
