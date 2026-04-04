// @ts-nocheck
// Game utility functions
import { type Game } from '../hooks/useGameData'
import { APEX_RANK_THRESHOLDS, VALORANT_RANK_THRESHOLDS, LOL_RANK_THRESHOLDS, SF6_RANK_THRESHOLDS } from '../constants/rankThresholds'

export const getGameRankGroups = (gameId: string) => {
  const gameRankMap: { [key: string]: any } = {
    'apex-legends': {
      ROOKIE: { name: 'ルーキー', icon: '🌱' },
      BRONZE: { name: 'ブロンズ', icon: '🥉' },
      SILVER: { name: 'シルバー', icon: '🥈' },
      GOLD: { name: 'ゴールド', icon: '🥇' },
      PLATINUM: { name: 'プラチナ', icon: '🥈' },
      DIAMOND: { name: 'ダイヤモンド', icon: '💎' },
      MASTER: { name: 'マスター', icon: '💜' },
      PREDATOR: { name: 'プレデター', icon: '👹' }
    },
    'valorant': {
      BRONZE: { name: 'ブロンズ', icon: '🥉' },
      SILVER: { name: 'シルバー', icon: '🥈' },
      GOLD: { name: 'ゴールド', icon: '🥇' },
      PLATINUM: { name: 'プラチナ', icon: '🥈' },
      DIAMOND: { name: 'ダイヤモンド', icon: '💎' },
      ASCENDANT: { name: 'アセンダント', icon: '🟠' },
      IMMORTAL: { name: 'イモータル', icon: '🔴' },
      RADIANT: { name: 'ラディアント', icon: '⭐' }
    },
    'league-of-legends': {
      BRONZE: { name: 'ブロンズ', icon: '🥉' },
      SILVER: { name: 'シルバー', icon: '🥈' },
      GOLD: { name: 'ゴールド', icon: '🥇' },
      PLATINUM: { name: 'プラチナ', icon: '🥈' },
      EMERALD: { name: 'エメラルド', icon: '💚' },
      DIAMOND: { name: 'ダイヤモンド', icon: '💎' },
      MASTER: { name: 'マスター', icon: '💜' },
      GRANDMASTER: { name: 'グランドマスター', icon: '💜' },
      CHALLENGER: { name: 'チャレンジャー', icon: '👑' }
    },
    'street-fighter-6': {
      IRON: { name: 'アイアン', icon: '⚔️' },
      BRONZE: { name: 'ブロンズ', icon: '🥉' },
      SILVER: { name: 'シルバー', icon: '🥈' },
      GOLD: { name: 'ゴールド', icon: '🥇' },
      PLATINUM: { name: 'プラチナ', icon: '🥈' },
      DIAMOND: { name: 'ダイヤモンド', icon: '💎' },
      MASTER: { name: 'マスター', icon: '💜' },
      LEGEND: { name: 'レジェンド', icon: '👑' }
    }
  }

  return gameRankMap[gameId] || gameRankMap['apex-legends']
}

export const isGameRankingBased = (rank: string): boolean => {
  const rankingBasedRanks = ['マスター', 'プレデター', 'イモータル1', 'イモータル2', 'イモータル3', 'ラディアント', 'マスター', 'グランドマスター', 'チャレンジャー', 'マスター', 'レジェンド']
  return rankingBasedRanks.includes(rank)
}

export const getGameValidDivisions = (gameId: string, rank: string): string[] => {
  // Return divisions for non-ranking-based ranks
  if (isGameRankingBased(rank)) {
    return []
  }
  
  // Game-specific divisions
  const gameDivisionMap: { [key: string]: { [key: string]: string[] } } = {
    'apex-legends': {
      'ルーキー': ['IV', 'III', 'II', 'I'],
      'ブロンズ': ['IV', 'III', 'II', 'I'],
      'シルバー': ['IV', 'III', 'II', 'I'],
      'ゴールド': ['IV', 'III', 'II', 'I'],
      'プラチナ': ['IV', 'III', 'II', 'I'],
      'ダイヤモンド': ['IV', 'III', 'II', 'I']
    },
    'valorant': {
      'ブロンズ': ['3', '2', '1'],
      'シルバー': ['3', '2', '1'],
      'ゴールド': ['3', '2', '1'],
      'プラチナ': ['3', '2', '1'],
      'ダイヤモンド': ['3', '2', '1'],
      'アセンダント': ['3', '2', '1']
    },
    'league-of-legends': {
      'ブロンズ': ['IV', 'III', 'II', 'I'],
      'シルバー': ['IV', 'III', 'II', 'I'],
      'ゴールド': ['IV', 'III', 'II', 'I'],
      'プラチナ': ['IV', 'III', 'II', 'I'],
      'エメラルド': ['IV', 'III', 'II', 'I'],
      'ダイヤモンド': ['IV', 'III', 'II', 'I']
    },
    'street-fighter-6': {
      'アイアン': ['IV', 'III', 'II', 'I'],
      'ブロンズ': ['IV', 'III', 'II', 'I'],
      'シルバー': ['IV', 'III', 'II', 'I'],
      'ゴールド': ['IV', 'III', 'II', 'I'],
      'プラチナ': ['IV', 'III', 'II', 'I'],
      'ダイヤモンド': ['IV', 'III', 'II', 'I']
    }
  }

  return gameDivisionMap[gameId]?.[rank] || ['IV', 'III', 'II', 'I']
}
