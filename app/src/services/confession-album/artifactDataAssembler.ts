export const assembleAlbumData = (config: any, entries: any[], contributions: any[]) => {
  return {
    config,
    entries,
    contributions,
  };
};

export const assembleProustsAnswerData = (player: any) => {
  return {
    proustId: player.id,
    summaryText: "Summary for player"
  };
};
