import {OnInit, Component} from '@angular/core';
import {Unit, UNITS} from "./config/data";
import {SPECIALS} from "./config/specials";
import {Sort} from '@angular/material/sort';
import {FormControl} from "@angular/forms";
import {map, Observable, startWith} from "rxjs";

type Match = [Unit, Unit]
type Matches = Match[]


type UnitState = {
  id: string
  paralyzed: boolean;
  poison: number;
  lastThrow: number[];
  weakness: number;
  corrosion: number;
}
type CombatState = {
  attacker: UnitState;
  defender: UnitState;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public displayedColumns: string[] = ['name', 'score','asAttacker','asDefender',  'resourceEfficiency', 'faction', 'tier'];
  public sortedData: any = [];
  public itterations = 100;
  public score = [];
  public matches: Matches = [];
  public isOneSided = false;

  public factionData = [];
  public factionDataSorted = [];
  public displayedColumnsFaction: string[] = ['faction', 'Bronze', 'Silver', 'Gold', 'Total'];


  public townData: any[] = [];
  public townDataSorted: any[] = [];
  public displayedColumnsTown = ['faction','bronze', 'silver', 'gold', 'few', 'pack', 'total'];


  public menuExpanded = true;
  public isGenerating = false;
  public process = 0;
  public processData = {
    current: 0,
    total: 0
  }

  unitAControl = new FormControl('');
  // @ts-ignore
  filteredUnitAOptions: Observable<any[]>;

  unitBControl = new FormControl('');
  // @ts-ignore
  filteredUnitBOptions: Observable<any[]>;

  // -----------------------------------------------------

  factions = [
    'Castle',
    'Dungeon',
    'Necropolis',
    'Tower',
    'Rampart',
    'Fortress',
    'Inferno',
    'Neutral',
  ]

  factionAControl = new FormControl('');
  // @ts-ignore
  filteredFactionAOptions: Observable<any[]>;

  factionBControl = new FormControl('');
  // @ts-ignore
  filteredFactionBOptions: Observable<any[]>;

  // @ViewChild(MatSort) sort: MatSort;

  public units: Unit[] = UNITS.map((unit) => {
    // unit.special = []
    return unit;
  });

  public displayMode: string = 'unit';
  public toggleDisplayMode = (event: any) => {
    this.displayMode = event.value;
  }
  public filterSettings = {
    Faction: {
      Bronze: true,
      Silver: true,
      Gold: true,
    },
    Neutral: {
      Bronze: true,
      Silver: true,
      Gold: true,
      Azure: true,
    },
    Simulation: {
      skills: true,
      pack: true
    }
  }

  constructor() {
    // console.log(this.units)
    this.sortedData = this.score.slice();
  }


  ngOnInit() {
    this.filteredUnitAOptions = this.unitAControl.valueChanges.pipe(
      startWith(''),
      map(value => this.unitFilter(value || '')),
    );

    this.filteredUnitBOptions = this.unitBControl.valueChanges.pipe(
      startWith(''),
      map(value => this.unitFilter(value || '')),
    );

    this.filteredFactionAOptions = this.factionAControl.valueChanges.pipe(
      startWith(''),
      map(value => this.factionFilter(value || '')),
    );

    this.filteredFactionBOptions = this.factionBControl.valueChanges.pipe(
      startWith(''),
      map(value => this.factionFilter(value || '')),
    );
  }

  private unitFilter(value: string): Unit[] {
    const filterValue = value.toLowerCase();
    return this.units.filter(option => option.id.toLowerCase().includes(filterValue)).sort((a: Unit,b:Unit) => {
      if (a.id.toLowerCase() < b.id.toLowerCase()) {
        return -1;
      }
      return 0;
    });
  }

  private factionFilter(value: string): String[] {
    const filterValue = value.toLowerCase();
    return this.factions.filter(option => option.toLowerCase().includes(filterValue)).sort((a: string,b:string) => {
      if (a.toLowerCase() < b.toLowerCase()) {
        return -1;
      }
      return 0;
    });
  }

  private filterMatchesArr(matches: Matches): Matches {
    return matches.filter((match: Match) => {
      if (
           match[0].tier === 'Bronze' && match[0].faction !== 'Neutral' && !this.filterSettings.Faction.Bronze
        || match[1].tier === 'Bronze' && match[1].faction !== 'Neutral' && !this.filterSettings.Faction.Bronze
      ) {
        return false;
      }
      if (
           match[0].tier === 'Bronze' && match[0].faction === 'Neutral' && !this.filterSettings.Neutral.Bronze
        || match[1].tier === 'Bronze' && match[1].faction === 'Neutral' && !this.filterSettings.Neutral.Bronze
      ) {
        return false;
      }
      return true;
    }).filter((match: Match) => {
      if (
        match[0].tier === 'Silver' && match[0].faction !== 'Neutral' && !this.filterSettings.Faction.Silver
        || match[1].tier === 'Silver' && match[1].faction !== 'Neutral' && !this.filterSettings.Faction.Silver
      ) {
        return false;
      }
      if (
        match[0].tier === 'Silver' && match[0].faction === 'Neutral' && !this.filterSettings.Neutral.Silver
        || match[1].tier === 'Silver' && match[1].faction === 'Neutral' && !this.filterSettings.Neutral.Silver
      ) {
        return false;
      }
      return true;
    }).filter((match: Match) => {
      if (
        match[0].tier === 'Gold' && match[0].faction !== 'Neutral' && !this.filterSettings.Faction.Gold
        || match[1].tier === 'Gold' && match[1].faction !== 'Neutral' && !this.filterSettings.Faction.Gold
      ) {
        return false;
      }
      if (
        match[0].tier === 'Gold' && match[0].faction === 'Neutral' && !this.filterSettings.Neutral.Gold
        || match[1].tier === 'Gold' && match[1].faction === 'Neutral' && !this.filterSettings.Neutral.Gold
      ) {
        return false;
      }
      return true;
    }).filter((match: Match) => {
      if (
        match[0].tier === 'Azure' && match[0].faction === 'Neutral' && !this.filterSettings.Neutral.Azure
        || match[1].tier === 'Azure' && match[1].faction === 'Neutral' && !this.filterSettings.Neutral.Azure
      ) {
        return false;
      }
      return true;
    }).filter((match: Match) => {
      if (
        match[0].upgradeFrom !== '' && !this.filterSettings.Simulation.pack
        || match[1].upgradeFrom !== '' && !this.filterSettings.Simulation.pack
      ) {
        return false;
      }
      return true;
    });
  }

  public changeFilterSetting(data: any) {
    const setting = data.source.id.split('.')
    // @ts-ignore
    this.filterSettings[setting[0]][setting[1]] = data.checked
  }

  public fromName(name: string | null) {
    if (name) {
      return name.toUpperCase().replace(/ /g, "_").replace(/_\*/g, " *");
    }
    return null;
  }

  public start(TYPE = "ALL") {
    let matches: Matches = [];
    this.isOneSided = false;

    // take a copy of the UNITS and if we dont want ot simulate skills remove them all here
    this.units = JSON.parse(JSON.stringify(UNITS));
    const units: Unit[] = this.units.map((unit: Unit) => {
      if (!this.filterSettings.Simulation.skills) {
        unit.special = [];
      }
      return unit;
    });

    if (TYPE === "ALL") {
      matches = this.setupPvAllBattleMatches(units);
    } else if (TYPE === "ALL-NF") {
      matches = this.setupPvAllOtherBattleMatches(units);
    } else if ( TYPE === "PvN") {
      matches = this.setupPvNeutralBattleMatches(units);
      // this.isOneSided = true;
    } else if ( TYPE === "PvP") {
      matches = this.setupPvPBattleMatches(units);
    }else if ( TYPE === "TEST") {
      matches = this.setupTestBattleMatches();
    }else if ( TYPE === "1v1") {
      const unitA = this.units.find((unit) => unit.id === this.fromName(this.unitAControl.value));
      const unitB = this.units.find((unit) => unit.id === this.fromName(this.unitBControl.value));
      if (!unitA || !unitB) {
        return;
      }
      matches = [[unitA, unitB],[unitB, unitA]]
      // matches = this.setupTestBattleMatches();
      this.itterations = 1000;
    } else if ( TYPE === "factionVfaction") {
      if (!this.factionAControl.value || !this.factionBControl.value) {
        return;
      }
      matches = this.setupFactionVFactionBattleMatches(units, this.factionAControl.value, this.factionBControl.value)

      this.itterations = 1000;
    }
    this.menuExpanded = false;
    matches = this.filterMatchesArr(matches)
    this.matches = matches;

    const battleResults = {};
    const resultPerUnit = {};
    this.isGenerating = true;
    this.process = 0;

    this.factionDataSorted = []
    this.sortedData = []

    this.processData.total = matches.length * this.itterations;

//TODO record per unit each simulation result so we can view against who they faired best

    setTimeout(() => {
      console.time("Simulation time")
      let promises = matches.map((match: Match, index: number) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const winnerData = this.doBattle(match[0], match[1]);
            if (winnerData) {
              this.addBattleResult(battleResults, winnerData, match[0], match[1], resultPerUnit)
            } else {
              this.addBattleResult(battleResults, undefined, match[0], match[1], resultPerUnit)
            }
            this.process = Math.round((index / matches.length) * 100);
            this.processData.current = (index  * this.itterations) - Math.floor(Math.random() * this.itterations);
            // @ts-ignore
            resolve();
          },0)
        })
      })

      Promise.all(promises)
        .then((results) => {
          setTimeout(() => {
            this.processData.current = 0;
            this.processData.total = 0;
            console.timeEnd("Simulation time")
            this.isGenerating = false;
            this.showScore(battleResults);
            console.log(resultPerUnit)
          }, 200)
        })
    }, 500)
  }

  private addBattleResult(score: any, winnerData: any, attacker: Unit, defender: Unit, resultPerUnit: any) {
    const add = function (score: any, unit: Unit, points: number, combatState: string, hasWon: boolean, opponent: Unit) {
      if (score[unit.id]) {
        score[unit.id][combatState] += points;
        score[unit.id].total += points;
      } else {
        score[unit.id] = {
          attacking: 0,
          defending: 0,
          total: 0,
          count: 0,
          wins: 0,
        }
        score[unit.id][combatState] += points;
        score[unit.id].total += points;
      }

      score[unit.id].count++;
      if (hasWon) {
        score[unit.id].wins++;
      }

      // -----------------------------
      if (!resultPerUnit[unit.id]) {
        resultPerUnit[unit.id] = new Map();
      }
        resultPerUnit[unit.id].set(opponent.id, points)
    }
    if (!winnerData) {
      add(score, attacker, 0,'attacking', false, defender);
      add(score, defender, 0,'defending', false, attacker);
      return
    }
    const winRate = winnerData.percentage;
    if (winnerData.winner.id === attacker.id) {
      // attacker won
      add(score, attacker, winRate,'attacking', true, defender);
      add(score, defender, 100 - winRate,'defending', false, attacker);
    } else {
      // defender won
      add(score, attacker, 100 - winRate,'attacking', false, defender);
      add(score, defender, winRate,'defending', true, attacker);
    }
  }


  private showScore(score: any) {
    const arr = Object.entries(score)
    // @ts-ignore
    const sorted = arr.sort((a, b) => b[1].total - a[1].total);

    const newScores = sorted.map((data) => {
      const unit = this.getUnitById(data[0]) as Unit;
      const downgrade = this.findDowngrade(unit) as Unit;
      const downgradeCost = downgrade ? this.calculateGoldCosts(downgrade.costs) : 0;

      const goldCosts = this.calculateGoldCosts(unit.costs) + downgradeCost;
      // @ts-ignore
      const scorePerCoin = Math.ceil(data[1].total / goldCosts);

      return [...data,...[scorePerCoin],unit.faction, unit.tier, this.statsScore(unit)]
    })
    // console.log(this.convertToTableStructure(newScores), newScores)
    this.score = this.convertToTableStructure(newScores);
    this.sortedData = this.score.slice();
    this.analyzeData(this.score)
  }

  statsScore(unit: Unit) {
    return {
      attack: unit.attack,
      defence: unit.defence,
      health: unit.health,
      initiative: unit.initiative,
      total: (unit.attack * 1)
        + (unit.defence  * 1)
        + (unit.health  * 1)
        + (unit.initiative * 1)
    }
  }

  analyzeData(data: any) {
    const townPower = new Map();
    const townefficiency = new Map();
    const townefficiencyFEW = new Map();
    const townefficiencyPACK = new Map();
    const townefficiencyBronze = new Map();
    const townefficiencySilver = new Map();
    const townefficiencyGold = new Map();
    const statScore = new Map();
    const tierResults: any = {
    };
    // data.forEach((data: any) => console.log(data.score))
    let total = data.reduce((acc: number, cur: any) => acc + cur.score, 0);
    // console.log('@', this.matches)

    const toPercentage = (amount: number) => {
      return Math.round((amount / total) * 10000)/ 100;
    }

    data.forEach((entry: any) => {


      if (!tierResults.hasOwnProperty(entry.faction)) {
        tierResults[entry.faction] = {
          Bronze: 0,
          Silver: 0,
          Gold: 0,
          Total: 0,
        }
      }
      tierResults[entry.faction][entry.tier] += entry.score;
      tierResults[entry.faction].Total += entry.score;
      if (entry.faction === "Neutral") {
        return
      }


      if (townPower.has(entry.faction)) {
        townPower.set(entry.faction,  townPower.get(entry.faction) + entry.score)
      } else {
        townPower.set(entry.faction, entry.score)
      }
      if (townefficiency.has(entry.faction) && isFinite(entry.resourceEfficiency)) {
        townefficiency.set(entry.faction,  townefficiency.get(entry.faction) + entry.resourceEfficiency)
      } else if(isFinite(entry.resourceEfficiency)) {
        townefficiency.set(entry.faction, entry.resourceEfficiency)
      }

      if (townefficiencyFEW.has(entry.faction) && isFinite(entry.resourceEfficiency) && !entry.name.includes('#')) {
        townefficiencyFEW.set(entry.faction,  (townefficiencyFEW.get(entry.faction) + entry.resourceEfficiency))
      } else if(isFinite(entry.resourceEfficiency) && !entry.name.includes('#')) {
        townefficiencyFEW.set(entry.faction, entry.resourceEfficiency)
      }

      if (townefficiencyPACK.has(entry.faction) && isFinite(entry.resourceEfficiency) && entry.name.includes('#')) {
        // console.log(entry.name, entry.resourceEfficiency)
        townefficiencyPACK.set(entry.faction,  (townefficiencyPACK.get(entry.faction) + entry.resourceEfficiency))
      } else if(isFinite(entry.resourceEfficiency) && entry.name.includes('#')) {
        townefficiencyPACK.set(entry.faction, entry.resourceEfficiency)
      }

      if (townefficiencyBronze.has(entry.faction) && isFinite(entry.resourceEfficiency) && entry.tier === 'Bronze') {
        townefficiencyBronze.set(entry.faction,  (townefficiencyBronze.get(entry.faction) + entry.resourceEfficiency))
      } else if(isFinite(entry.resourceEfficiency) && entry.tier === "Bronze") {
        townefficiencyBronze.set(entry.faction, entry.resourceEfficiency)
      }

      if (townefficiencySilver.has(entry.faction) && isFinite(entry.resourceEfficiency) && entry.tier === 'Silver') {
        townefficiencySilver.set(entry.faction,  (townefficiencySilver.get(entry.faction) + entry.resourceEfficiency))
      } else if(isFinite(entry.resourceEfficiency) && entry.tier === "Silver") {
        townefficiencySilver.set(entry.faction, entry.resourceEfficiency)
      }

      if (townefficiencyGold.has(entry.faction) && isFinite(entry.resourceEfficiency) && entry.tier === 'Gold') {
        townefficiencyGold.set(entry.faction,  (townefficiencyGold.get(entry.faction) + entry.resourceEfficiency))
      } else if(isFinite(entry.resourceEfficiency) && entry.tier === "Gold") {
        townefficiencyGold.set(entry.faction, entry.resourceEfficiency)
      }



      if (statScore.has(entry.faction)) {
        statScore.set(entry.faction,  statScore.get(entry.faction) + entry.statsScore.total)
      } else {
        statScore.set(entry.faction, entry.statsScore.total)
      }
    });
    delete tierResults['Test'];

    const factionData: any= [];
    Object.entries(tierResults).forEach((data:any) => {
      data[1].Bronze = toPercentage(data[1].Bronze)
      data[1].Silver = toPercentage(data[1].Silver)
      data[1].Gold = toPercentage(data[1].Gold)
      data[1].Total = toPercentage(data[1].Total)
      factionData.push({faction: data[0], ...data[1]})
    })
    this.factionData = factionData;
    this.factionDataSorted = factionData;

    this.sortChangeUnits({
      active: 'score',
      direction: 'desc'
    })

    this.sortChangeFaction({
      active: 'Total',
      direction: 'desc'
    })

    // console.log('Faction power', townPower)
    console.log('Faction efficiency', townefficiency)
    console.log('Faction efficiency Few', townefficiencyFEW)
    console.log('Faction efficiency Pack', townefficiencyPACK)
    console.log('Faction efficiency Bronze', townefficiencyBronze)
    console.log('Faction efficiency Silver', townefficiencySilver)
    console.log('Faction efficiency Gold', townefficiencyGold)

    const calculateFactionCost = (faction: string) => {
        return this.units.filter((entry) => entry.faction === faction).reduce((sum, unit) => {
          return sum + unit.costs[0] + (unit.costs[1] * 6);
        }, 0)
    }

    console.log('Castle', calculateFactionCost('Castle'));
    console.log('Conflux', calculateFactionCost('Conflux'));
    console.log('Cove', calculateFactionCost('Cove'));
    console.log('Dungeon', calculateFactionCost('Dungeon'));
    console.log('Fortress', calculateFactionCost('Fortress'));
    console.log('Inferno', calculateFactionCost('Inferno'));
    console.log('Necropolis', calculateFactionCost('Necropolis'));
    console.log('Rampart', calculateFactionCost('Rampart'));
    console.log('Stronghold', calculateFactionCost('Stronghold'));
    console.log('Tower', calculateFactionCost('Tower'));
    this.townData = [];

    const factionUnitCount = (total = true) => {
      let factionUnitCounter = 0;
      if (this.filterSettings.Faction.Bronze) factionUnitCounter += 3;
      if (this.filterSettings.Faction.Silver) factionUnitCounter += 2;
      if (this.filterSettings.Faction.Gold) factionUnitCounter += 2;
      if (this.filterSettings.Simulation.pack && total) factionUnitCounter *= 2;
      return factionUnitCounter
    }

    const notNaNRound = function (value: number) {
      return isNaN(value) ? '-' : Math.round(value);
    }

    townefficiencyFEW.forEach((data, faction) => {
      const isTower = faction === 'Tower' ? 1 : 0;
      this.townData.push({
        faction: faction,
        bronze: notNaNRound(townefficiencyBronze.get(faction) / (6 - isTower)),
        silver: notNaNRound(townefficiencySilver.get(faction) / 4),
        gold: notNaNRound(townefficiencyGold.get(faction) / 4),
        few: notNaNRound(data / (factionUnitCount(false) - isTower )),
        pack: notNaNRound(townefficiencyPACK.get(faction) / factionUnitCount(false)),
        total: Math.round(townefficiency.get(faction)  / (factionUnitCount()- isTower))
      })
    });

    this.townDataSorted = this.townData.slice();
    this.sortChangeTown({
      active: 'total',
      direction: 'desc'
    })

  }

  sortChangeUnits(sort: Sort) {
    const data = this.sortedData.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }
    // @ts-ignore
    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name':
          return compare(a.name, b.name, isAsc);
        case 'score':
          return compare(a.score, b.score, isAsc);
        case 'asAttacker':
          return compare(a.asAttacker, b.asAttacker, isAsc);
        case 'asDefender':
          return compare(a.asDefender, b.asDefender, isAsc);
        case 'resourceEfficiency':
          return compare(a.resourceEfficiency, b.resourceEfficiency, isAsc);
        case 'faction':
          // @ts-ignore
          return compare(a.faction, b.faction, isAsc);
        case 'tier':
          // @ts-ignore
          return compare(a.tier, b.tier, isAsc);
        default:
          return 0;
      }
    });

    function compare(a: number | string, b: number | string, isAsc: boolean) {
      return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
  }

  sortChangeFaction(sort: Sort) {
    const data = this.factionDataSorted.slice();
    if (!sort.active || sort.direction === '') {
      this.factionDataSorted = data;
      return;
    }
    // @ts-ignore
    this.factionDataSorted = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'Bronze':
          // @ts-ignore
          return compare(a.Bronze, b.Bronze, isAsc);
        case 'Silver':
          // @ts-ignore
          return compare(a.Silver, b.Silver, isAsc);
        case 'Gold':
          // @ts-ignore
          return compare(a.Gold, b.Gold, isAsc);
        case 'Total':
          // @ts-ignore
          return compare(a.Total, b.Total, isAsc);
        default:
          return 0;
      }
    });

    function compare(a: number | string, b: number | string, isAsc: boolean) {
      return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
  }

  sortChangeTown(sort: Sort) {
    const data = this.townDataSorted.slice();
    if (!sort.active || sort.direction === '') {
      this.townDataSorted = data;
      return;
    }
    // @ts-ignore
    this.townDataSorted = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'faction':
          // @ts-ignore
          return compare(a.faction, b.faction, isAsc);
        case 'bronze':
          // @ts-ignore
          return compare(a.bronze, b.bronze, isAsc);
        case 'silver':
          // @ts-ignore
          return compare(a.silver, b.silver, isAsc);
        case 'gold':
          // @ts-ignore
          return compare(a.gold, b.gold, isAsc);
        case 'few':
          // @ts-ignore
          return compare(a.few, b.few, isAsc);
        case 'pack':
          // @ts-ignore
          return compare(a.pack, b.pack, isAsc);
        case 'total':
          // @ts-ignore
          return compare(a.total, b.total, isAsc);
        default:
          return 0;
      }
    });

    function compare(a: number | string, b: number | string, isAsc: boolean) {
      return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
  }

  private convertToTableStructure(data: any) {
    const percentage = function (total: number, count: number) {
      return Math.round((total / count) * 100) / 100;
    }
    return data.map((entry: any) => {
      const devide = this.isOneSided ? 1 : 2;
      return {
        name: this.name(entry[0]),
        asAttacker:  percentage(entry[1].attacking , entry[1].count / devide),
        asDefender:  percentage(entry[1].defending , entry[1].count / devide),
        score: percentage(entry[1].total , entry[1].count),
        resourceEfficiency: entry[2],
        faction: entry[3],
        tier: entry[4],
        statsScore: entry[5],
      }
    })
  }

  private getUnitById(id: string) {
    return this.units.find((unit) => unit.id === id)
  }
  private calculateGoldCosts(costs:[number,number]) {
    return costs[0] + (costs[1] * 6)
  }

  private addScore(winnerData: any, score: any) {
    const unit = winnerData.winner;
    if (!score[unit.id]) {
      score[unit.id] = winnerData.percentage; // or just add one win???
    } else {
      score[unit.id] += winnerData.percentage;
    }
  }

  private setupPvAllBattleMatches(units: Unit[]) {
    const matches: any = [];
    units.forEach((unitA: Unit) => {
      units.forEach((unitB: Unit) => {
        if (unitA.id !== unitB.id) { // or unit.id??
          matches.push([unitA, unitB]);
        }
      })
    });
    return matches;
  }
  private setupPvAllOtherBattleMatches(units: Unit[]) {
    const matches: any = [];
    units.forEach((unitA: Unit) => {
      units.forEach((unitB: Unit) => {
        if (unitA.id !== unitB.id && (unitA.faction !== unitB.faction || unitB.faction === 'Neutral')) { // or unit.id??
          matches.push([unitA, unitB]);
        }
      })
    });
    return matches;
  }

  private setupPvNeutralBattleMatches(units: Unit[]) {
    const matches: any = [];
    units.forEach((unitA: Unit) => {
      units.forEach((unitB: Unit) => {
        if (unitA.id !== unitB.id &&
          (unitA.faction !== "Neutral" && unitB.faction === "Neutral") || unitA.faction === "Neutral" && unitB.faction !== "Neutral"
        ) {
          matches.push([unitA, unitB]);
        }
      })
    });
    return matches;
  }

  private setupPvPBattleMatches(units: Unit[]) {
    const matches: any = [];
    units.forEach((unitA: Unit) => {
      units.forEach((unitB: Unit) => {
        if (unitA.id !== unitB.id && unitA.faction !== "Neutral" && unitB.faction !== "Neutral" && unitA.faction !== unitB.faction) {
          matches.push([unitA, unitB]);
        }
      })
    });
    return matches;
  }

  private setupFactionVFactionBattleMatches(units: Unit[], factionA: string, factionB: string) {
    const matches: any = [];
    units.forEach((unitA: Unit) => {
      units.forEach((unitB: Unit) => {
        if (
          unitA.faction !== unitB.faction &&
          (unitA.faction === factionA || unitA.faction === factionB) &&
          (unitB.faction === factionA || unitB.faction === factionB)
        ) {
          matches.push([unitA, unitB]);
        }
      })
    });
    return matches;
  }

  private setupTestBattleMatches() {
    const matches: any = [];
    this.units.forEach((unitA: Unit) => {
      this.units.forEach((unitB: Unit) => {
        if (unitA.id !== unitB.id && unitA.faction === "Test" && unitB.faction !== "Test") {
          matches.push([unitA, unitB]);
        }
      })
    });
    return matches;
  }

  public doBattle(a: Unit, d: Unit) {
    let attacker = {...a};
    let defender = {...d};
    if (d.initiative > a.initiative) {
      attacker = {...d};
      defender = {...a};
    }
    let attackerWon = 0;
    let defenderWon = 0;

    for(let i = 0; i<this.itterations; i++) {
      const initialState: CombatState = {
        attacker: {
          id: attacker.id,
          paralyzed: false,
          lastThrow: [],
          poison: 0,
          weakness: 0,
          corrosion: 0,
        },
        defender: {
          id: defender.id,
          paralyzed: false,
          lastThrow: [],
          poison: 0,
          weakness: 0,
          corrosion: 0,
        }
      }
      const winner = this.startCombat({...attacker}, {...defender}, false, initialState);
      if (winner === null) {
        return
      }
      if (winner.id === attacker.id) {
        attackerWon++;
      } else {
        defenderWon++;
      }
    }

    if (attackerWon > defenderWon) {
      // console.log(`${this.name(attacker.id)} has won (${attackerWon}/${itterations}) agains ${this.name(defender.id)}`)
      // console.log('-----------------------------------')
      return {
        winner: attacker,
        percentage: Math.round((attackerWon/this.itterations) * 100)
      };
    } else {
      // console.log(`${this.name(defender.id)} has won (${defenderWon}/${itterations}) agains ${this.name(attacker.id)}`)
      // console.log('-----------------------------------')
      return {
        winner: defender,
        percentage: Math.round((defenderWon/this.itterations) * 100)
      };
    }

  }

  private hasSkill(unit: Unit, skill: number) {
    return unit.special.find((special) => special === skill) !== undefined;
  }

  private checkAdjacency(unit: Unit, isAdjacent: boolean) {
    return isAdjacent || !unit.ranged
  }

  private startCombat(attacker: Unit, defender: Unit, isAdjacent:boolean, state: CombatState, combatRound = 0): Unit | null {
    const deathStare = () => {
      if(this.hasSkill(attacker, SPECIALS.DEATH_STARE)) {
        const roll1 = this.roll();
        const roll2 = this.roll();
        if (roll1 === -1 && roll2 === -1) {
            defender.health = 0;
        }
      }
    }

    isAdjacent = this.checkAdjacency(attacker, isAdjacent);

    // ACTIVATION PHASE
    if (this.hasSkill(attacker, SPECIALS.HEAL_ONE_ON_ACTIVATION)) {
      const data = this.getUnitById(attacker.id) as Unit;
      if (attacker.health < data.health) {
        attacker.health++;
      }
    }

    if (this.hasSkill(attacker, SPECIALS.HEAL_TWO_ON_ACTIVATION)) {
      const data = this.getUnitById(attacker.id) as Unit;
      attacker.health+=2;
      if (attacker.health > data.health) {
        attacker.health = data.health;
      }
    }

    if (this.hasSkill(attacker, SPECIALS.HEAL_THREE_ON_ACTIVATION)) {
      const data = this.getUnitById(attacker.id) as Unit;
      attacker.health+=3;
      if (attacker.health > data.health) {
        attacker.health = data.health;
      }
    }

    if (this.hasSkill(attacker, SPECIALS.FAERIE_SPELL_ATTACK)) {
      let baseDamage = 2;
      if (
        this.hasSkill(defender, SPECIALS.IGNORE_DAMAGE_FROM_SPECIALS_AND_MAGIC)
        && this.hasSkill(defender, SPECIALS.SPELL_REDUCTION_TWO)
        && this.hasSkill(defender, SPECIALS.SPELL_REDUCTION_THREE)
      ) {
        baseDamage = 0;
      }
      if (this.hasSkill(defender, SPECIALS.SPELL_REDUCTION_ONE)) {
        baseDamage = 1;
      }


      defender.health-=baseDamage;
      if (this.isDead(defender)) {
        const downgrade = this.findDowngrade(defender)
        if (!downgrade) {
          return attacker;
        } else {
          defender = this.doDowngrade(defender, downgrade);
          if (this.isDead(defender)) {
            return attacker;
          }
        }
      }
    }

    if (state.attacker.poison > 0) {
      state.attacker.poison--;
      attacker.health--;
      if (this.isDead(attacker)) {
        const downgrade = this.findDowngrade(attacker)
        if (!downgrade) {
          return defender;
        } else {
          attacker = this.doDowngrade(attacker, downgrade);
        }
      }
    }

    // ATTACK PHASE

    if (state.attacker.paralyzed) {
      state.attacker.paralyzed = false;
    } else {
      // ATTACK (if not paralyzed
      let damageModifier = 0;
      if (this.hasSkill(attacker, SPECIALS.ENCHANTER)) {
        damageModifier = 1;
      }

      if (
        this.hasSkill(attacker, SPECIALS.BONUS_AGAINST_ARCH_DEVIL)
        && (defender.id === "ARCH_DEVILS" || defender.id === "ARCH_DEVILS_#PACK" || defender.id === "ARCH_DEVILS *")
      ) {
        damageModifier = 2;
      }
      if (
        this.hasSkill(attacker, SPECIALS.BONUS_AGAINST_BLACK_DRAGON)
        && (defender.id === "BLACK_DRAGONS" || defender.id === "BLACK_DRAGONS_#PACK" || defender.id === "BLACK_DRAGONS *")
      ) {
        damageModifier = 2;
      }
      if (
        this.hasSkill(attacker, SPECIALS.BONUS_AGAINST_ARCH_ANGELS)
        && (defender.id === "ARCHANGELS" || defender.id === "ARCHANGELS_#PACK" || defender.id === "ARCHANGELS *")
      ) {
        damageModifier = 2;
      }
      if (
        this.hasSkill(attacker, SPECIALS.BONUS_AGAINST_EFREET)
        && (defender.id === "EFREETS" || defender.id === "EFREETS_#PACK" || defender.id === "EFREETS *")
      ) {
        damageModifier = 1;
      }
      if(this.hasSkill(attacker, SPECIALS.WEAKNESS_ON_ATTACK)) {
        state.defender.weakness += 1;
      }
      if(state.attacker.weakness > 0) {
        damageModifier--;
        state.attacker.weakness--;
      }
      if(this.hasSkill(attacker, SPECIALS.DECREASE_DEFENCE_AND_CORODE)) {
        state.defender.corrosion += 1;
      }

      this.doDamage(attacker, defender, isAdjacent, false, state, damageModifier);
      if (this.hasSkill(attacker, SPECIALS.LIGHTNING) && !this.hasSkill(defender, SPECIALS.IGNORE_DAMAGE_FROM_SPECIALS_AND_MAGIC)) {
        if (this.roll() === 1) {
          defender.health -=1;
        }
      }

      if (this.hasSkill(attacker, SPECIALS.POISON)) {
        state.defender.poison++;
      }
      if (this.hasSkill(attacker, SPECIALS.MIGHTY_POISON)) {
        state.defender.poison+=2;
      }
      if (this.hasSkill(attacker, SPECIALS.CHANCE_MOVE_ENEMY_ON_ATTACK)) {
        if(this.roll() === 0) {
          isAdjacent = false;
        }
      }

      if (defender.health < 0 && this.hasSkill(defender, SPECIALS.REBIRTH)) {
        defender.special = [];
        defender.health = 1;
      }

      if (this.isDead(defender)) {
        const downgrade = this.findDowngrade(defender)
        if (!downgrade) {
          return attacker;
        } else {
          defender = this.doDowngrade(defender, downgrade);
          deathStare();
          if (this.isDead(defender)) {
            return attacker;
          }
        }
      } else {
        deathStare();
        if (this.isDead(defender)) {
          return attacker;
        }
      }

      // RETALIATE
      if (this.hasSkill(attacker, SPECIALS.IGNORE_RETALIATION) || (attacker.ranged && !isAdjacent) || !isAdjacent) {
        // Don't retaliate if the attacker ignores it
        // or if the attacker is ranged but not adjacent to the defender
      } else {
        // console.log(defender.id, 'RETALLIATE')
        let damageModifier = 0;
        if (this.hasSkill(attacker, SPECIALS.LOWER_RETALIATION_DAMAGE)) {
          damageModifier = -1;
        }
        this.doDamage(defender, attacker, isAdjacent, true, state, damageModifier);
        if (attacker.health < 0 && this.hasSkill(attacker, SPECIALS.REBIRTH)) {
          attacker.special = [];
          attacker.health = 1;
        }
        if (this.hasSkill(defender, SPECIALS.LIGHTNING) && !this.hasSkill(attacker, SPECIALS.IGNORE_DAMAGE_FROM_SPECIALS_AND_MAGIC)) {
          if (this.roll() === 1) {
            attacker.health -=1;
          }
        }
      }

      if (this.isDead(attacker)) {
        const downgrade = this.findDowngrade(attacker)
        if (!downgrade) {
          return defender;
        } else {
          attacker = this.doDowngrade(attacker, downgrade);
          if (this.isDead(attacker)) {
            return defender;
          }
        }
      }

      if (this.hasSkill(attacker, SPECIALS.DOUBLE_ATTACK)) {
        this.doDamage(attacker, defender, isAdjacent, false, state, damageModifier);
        if (this.isDead(defender)) {
          const downgrade = this.findDowngrade(defender)
          if (!downgrade) {
            return attacker;
          } else {
            defender = this.doDowngrade(defender, downgrade);
          }
        }
      }

      // SKILL ACTIVATION DURING ATTACK
      if (this.hasSkill(attacker, SPECIALS.CHANCE_TO_PARALYZE_MINUS_ONE) && this.containsRoll(state.attacker.lastThrow, -1)) {
        state.defender.paralyzed = true;
      }
      if (this.hasSkill(attacker, SPECIALS.CHANCE_TO_PARALYZE) && this.roll() === 0) {
        state.defender.paralyzed = true;
      }
      if (this.hasSkill(attacker, SPECIALS.HIGH_CHANCE_TO_PARALYZE) && this.roll() !== -1) {
        state.defender.paralyzed = true;
      }
      if (this.hasSkill(attacker, SPECIALS.CHANCE_TO_POISON) && this.roll() === 0) {
        state.defender.poison++;
      }

      if (this.hasSkill(attacker, SPECIALS.FEAR) && this.containsRoll(state.attacker.lastThrow, -1)) {
        state.defender.paralyzed = true;
      }
    }

    if (this.hasSkill(attacker, SPECIALS.IGNORE_PARALYSIS)) {
      state.attacker.paralyzed = false;
    }
    if (this.hasSkill(defender, SPECIALS.IGNORE_PARALYSIS)) {
      state.defender.paralyzed = false;
    }

    // CONTINUE FIGHT BY SWAPPING ATTACKER AND DEFENDER
    state = this.switchState(state)

    if (combatRound >= 20) {
      // if it takes more then 2 rounds, quit.
      return null;
    }
    return this.startCombat(defender, attacker, isAdjacent, state, combatRound += 1);
  }

  private switchState(state: CombatState) {
    const newState: CombatState = {
      attacker: {...state.defender},
      defender: {...state.attacker}
    }
    newState.attacker.lastThrow = [];
    newState.defender.lastThrow = [];
    return newState;
  }

  private roll = function () {
    return Math.floor(Math.random() * 3) - 1
  }

  private doDowngrade(upgrade: Unit, downgrade: Unit) {
    let attackModifier = 0;
    if(this.hasSkill(downgrade, SPECIALS.REVENGE)) {
      attackModifier = 2;
    }
    upgrade.health += downgrade.health; // set new health but adjust for negative damage.
    upgrade.attack = downgrade.attack + attackModifier;
    upgrade.defence = downgrade.defence;
    upgrade.initiative = downgrade.initiative;
    upgrade.ranged = downgrade.ranged;
    upgrade.special = downgrade.special;
    upgrade.upgradeFrom = downgrade.upgradeFrom;
    // console.log(`${upgrade.id} has been downgraded to ${downgrade.id}(${upgrade.health})`)
    return upgrade;
  }

  private findDowngrade(unit: Unit) {
    return this.units.find((un) => {
      return un.id === unit.upgradeFrom
    });
  }

  private isDead(target: Unit) {
    return target.health <= 0;
  }

  private doDamage(source: Unit, target: Unit, isAdjacent: boolean, retalliation: boolean, state: CombatState, damageModifier = 0) {
    if(this.hasSkill(source, SPECIALS.HEAL_TWO_ON_ATTACK) && !retalliation) {
      const data = this.getUnitById(source.id) as Unit;
      if (source.health < data.health) {
        source.health += 2;
        if (source.health > data.health) {
          source.health = data.health;
        }
      }
    }
    const isRangedVsRanged = source.ranged && target.ranged && !isAdjacent && !this.hasSkill(source, SPECIALS.IGNORE_COMBAT_PENALTY);
    const isRangedVsAdjacent = source.ranged && isAdjacent;
    const combatPenalty = isRangedVsRanged || (isRangedVsAdjacent && !this.hasSkill(source, SPECIALS.IGNORE_COMBAT_PENALTY_ADJACENT));
    const attackRoll = () => {
      if (this.hasSkill(source, SPECIALS.NO_ROLL_FOR_ATTACK) && !retalliation) {
        return 0;
      }
      if (this.hasSkill(target, SPECIALS.CURSE)) {
        return -1;
      }
      if (this.hasSkill(target, SPECIALS.RETALIATION_CURSE) && retalliation) {
        return Math.min(this.roll(), this.roll());
      }
      if (this.hasSkill(source, SPECIALS.CRUSADERS_ATTACK)) {
        return Math.max(this.roll(), this.roll());
      }
      if (this.hasSkill(source, SPECIALS.ALWAYS_REROLL_MINUS_ONE)) {
        return Math.max(this.roll(), this.roll());
      }
      if (this.hasSkill(source, SPECIALS.ALWAYS_REROLL_MINUS_ONE)) {
        return Math.max(this.roll(), this.roll());
      }
      return this.attackRoll(
        combatPenalty,
        (this.hasSkill(source, SPECIALS.REROLL_ZERO_ON_DICE) && !retalliation),
        (this.hasSkill(source, SPECIALS.REROLL_ON_OTHER_SPACE) && !retalliation) || (this.hasSkill(source, SPECIALS.ATTACK_REROLL_MINUS_ONE)),
        (this.hasSkill(source, SPECIALS.LUCK) && !retalliation),
        (this.hasSkill(source, SPECIALS.ADD_ONE_TO_ATTACK_DICE) && !retalliation),
      );
    };

    const attack = () => {
      const isNotNegative = function(damage: number) {
        return damage < 0 ? 0 : damage;
      }

      const strike = () => {
        let rollResult = attackRoll();
        state.attacker.lastThrow.push(rollResult);

        if (this.hasSkill(source, SPECIALS.CHAMPION_DOUBLE_ROLL)) {
          const roll = attackRoll();
          state.attacker.lastThrow.push(roll);
          rollResult += roll;
        }

        if (this.hasSkill(source, SPECIALS.DEATH_BLOW) && rollResult >= 0) {
          damageModifier++;
        }
        return isNotNegative(source.attack + rollResult + damageModifier)
      }

      // SPECIALS.DOUBLE_ATTACK_NON_ADJACENT
      if (this.hasSkill(source, SPECIALS.DOUBLE_ATTACK_NON_ADJACENT) && !isAdjacent) {
        return strike() + strike();
      }

      // NOT_ADJACENT_CHANCE_DOUBLE_ATTACK
      if (this.hasSkill(source, SPECIALS.NOT_ADJACENT_CHANCE_DOUBLE_ATTACK) && !isAdjacent) {
        const firstStrike = strike();
        if (this.containsRoll(state.attacker.lastThrow, 0) || this.containsRoll(state.attacker.lastThrow, -1)) {
          return firstStrike + strike();
        }
        return strike();
      }

      return strike();
    }

    const targetDefence = () => {
      let modifier = 0;
      //SPECIALS.IGNORE_DEFENCE
      if (this.hasSkill(source, SPECIALS.IGNORE_DEFENCE)) {
        return 0;
      }

     
      if (this.hasSkill(target, SPECIALS.DEFENCE_ON_ATTACK_ONE) && this.containsRoll(state.attacker.lastThrow, 1)) {
        modifier++;
      }
      if (this.hasSkill(target, SPECIALS.DEFENCE_ON_ATTACK_ZERO_ONE)
        && (this.containsRoll(state.attacker.lastThrow, 0) || this.containsRoll(state.attacker.lastThrow, 1))) {
        modifier++;
      }
      if (this.hasSkill(source, SPECIALS.RUST_ATTACK) && this.containsRoll(state.attacker.lastThrow, -1)) {
        modifier -= 2;
      }
      if (this.hasSkill(source, SPECIALS.DECREASE_DEFENCE)) {
        if (target.defence > 0) {
          modifier--;
        }
      }
      if (this.hasSkill(source, SPECIALS.DECREASE_DEFENCE_AND_CORODE)) {
        if (target.defence > 1) {
          modifier-=2;
        } else if (target.defence > 0) {
          modifier--;
        }
      }
      // generate function that checks the state if the current target is teh attacker or defender
      if (target.id === state.attacker.id) {
        if (state.attacker.corrosion > 0) {
          modifier--;
          state.attacker.corrosion--;
        }
      }

      if (target.id === state.defender.id) {
        if (state.defender.corrosion > 0) {
          modifier--;
          state.defender.corrosion--;
        }
      }

      
      return target.defence + modifier <= 0 ? 0 : target.defence + modifier;
    }

    let damage = attack() - targetDefence();
    if (this.hasSkill(target, SPECIALS.LIMIT_DAMAGE_FROM_ATTACK) && damage > 4) {
      damage = 4;
    }
    target.health -= damage;
  }

  private attackRoll(combatPenalty: boolean, reRollOnZero: boolean, reRollOnNewSpace: boolean, luck: boolean, increaseRollOne: boolean) {
    if (reRollOnZero) {
      return Math.random() < 0.5 ? -1 : 1;
    }
    const roll = function () {
      return Math.floor(Math.random() * 3) - 1
    }
    if (reRollOnNewSpace) {
      const diceRoll = roll();
      if (diceRoll === -1) {
        return roll()
      }
      return diceRoll;
    }
    if (luck) {
      return Math.max(roll(),roll());
    }
    if (combatPenalty) {
      return Math.min(roll(),roll());
    }
    if (increaseRollOne) {
      return roll() + 1;
    }
    return roll();
  }

  public name(id: string) {
    return (id.charAt(0) + id.slice(1).toLowerCase()).replace(/_/g, " ")
  }

  private containsRoll(throws: number[], nr: number) {
    return throws.findIndex(entry => entry === nr) !== -1;
  }

  public getRowColor(faction: string) {
    return 'row_color__' + faction.toLowerCase();
  }

  public setIterations(amount: number) {
    this.itterations = amount;
  }

  public menuToggled(isOpen: boolean) {
    this.menuExpanded = isOpen;
  }
}

const choose = function(arr: any, k: any, prefix: any=[]) {
  if (k == 0) return [prefix];
  return arr.flatMap((v: any, i: number) =>
    choose(arr.slice(i+1), k-1, [...prefix, v])
  );
}
