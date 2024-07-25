let Time = 0;
let Timer;
const CoinSoundEffect = new Audio("Sound-Effects/Coin.mp3");
const CorrectAnswerSoundEffect = new Audio("Sound-Effects/CorrectAnswer.mp3");
const WrongAnswerSoundEffect = new Audio("Sound-Effects/WrongAnswer.mp3");
const LevelUpSoundEffect = new Audio("Sound-Effects/LevelUp.mp3");

const HintCost = 30;
const LetterCost = 10;
const WordCost = 100;
const BaseReward = 7;
let GameStat = {
  Coins: null,
  Level: null,
  MinIndex: null,
  MaxIndex: null,
  Time: null,
  TryCounter: null,
  IsMusicPlaying: false,
  MaxLevel: 15,
};
let Inbox = [];
const Container = document.getElementById("container");
window.onload = function () {
  LoadHTMLElements("DisplayHeaderColumn1");
  LoadHTMLElements("DisplayHomePage");
  LoadHTMLElements("LoadMusicTag");
};
window.addEventListener("resize", function () {
  UIHandler("ResizeLetterBox");
});
window.addEventListener("resize", function () {
  SetKeysWidth();
});
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "hidden" && !localStorage.getItem("IsMusicSettingModified")) {
    PauseBackgroundMusic();
  } else if (document.visibilityState === "visible" && !localStorage.getItem("IsMusicSettingModified")) {
    PlayBackgroundMusic();
  }
});

// Functions Related to Background Music and Audio
function ToggleMusic() {
  localStorage.setItem("IsMusicSettingModified", true);
  GameStat.IsMusicPlaying = !GameStat.IsMusicPlaying;
  GameStat.IsMusicPlaying ? PlayBackgroundMusic() : PauseBackgroundMusic();
}
function PauseBackgroundMusic() {
  localStorage.setItem("IsMusicPlaying", false);
  let ToggleBgMusicBtn = document.getElementById("toggle-bg-music-btn");
  let BackgroundMusic = document.getElementById("music");
  BackgroundMusic.pause();
  ToggleBgMusicBtn.innerHTML = "<img src='Icons/NoMusicIcon.png'>";
  UIHandler("DisplayMessage", `<img src="Icons/NoMusicIcon.png">`);
}
function PlayBackgroundMusic() {
  localStorage.setItem("IsMusicPlaying", true);
  let ToggleBgMusicBtn = document.getElementById("toggle-bg-music-btn");
  let BackgroundMusic = document.getElementById("music");
  BackgroundMusic.play();
  ToggleBgMusicBtn.innerHTML = "<img src='Icons/MusicIcon.png'>";
  UIHandler("DisplayMessage", `<img src="Icons/MusicIcon.png">`);
}
function AudioManager(action) {
  switch (action) {
    case "Coin":
      CoinSoundEffect.currentTime = 0;
      CoinSoundEffect.play();
      break;
    case "CorrectAnswer":
      CorrectAnswerSoundEffect.currentTime = 0;
      CorrectAnswerSoundEffect.play();
      break;
    case "WrongAnswer":
      WrongAnswerSoundEffect.currentTime = 0;
      WrongAnswerSoundEffect.play();
      break;
    case "LevelUp":
      LevelUpSoundEffect.currentTime = 0;
      LevelUpSoundEffect.play();
      break;
    case "Click":
      break;
  }
}
// Functions Related to Timer
function StartTimer() {
  Timer = setInterval(function () {
    GameStat.Time++;
  }, 1000);
}
function StopTimer() {
  clearInterval(Timer);
}
function ResetTimer() {
  clearInterval(Timer);
  GameStat.Time = 0;
}
// Functions Related to Starting/Continueing  the game
function ContinueGame() {
  PlayBackgroundMusic();
  LoadHTMLElements("DisplayLevel");
  LoadHTMLElements("DisplayHeaderColumn2");
  LoadHTMLElements("DisplayGameArea");
  LoadSave();
  GetWord();
}
function Start() {
  PlayBackgroundMusic();
  LoadHTMLElements("DisplayHeaderColumn2");
  LoadHTMLElements("DisplayGameArea");
  LoadHTMLElements("DisplayLevel");
  UpdateGameStat("NewGame");
  GetWord();
}
// Functions Related to Game Mechanic such as Getting/Scrambling/Validating Word and Checking User Answer
function GetWord() {
  CreateScrambledWord(Inbox[GameStat.MinIndex].word);
}
function CreateScrambledWord(Word) {
  let WordArray = Word.split("").reverse();
  let ScrambledWordArray = [];
  let RandomIndexArray = [];
  while (RandomIndexArray.length < WordArray.length) {
    let RandomIndex = Math.round(Math.random() * (WordArray.length - 1));
    if (!RandomIndexArray.includes(RandomIndex)) {
      RandomIndexArray.push(RandomIndex);
      ScrambledWordArray.push(WordArray[RandomIndex]);
    }
  }
  ValidateScrambledArray(ScrambledWordArray, WordArray, Word);
}
function ValidateScrambledArray(ScrambledWordArray, WordArray, Word) {
  let IsScrambledWordValid = false;
  if (!(JSON.stringify(ScrambledWordArray) !== JSON.stringify(WordArray))) {
    CreateScrambledWord(Word);
  } else if (!(JSON.stringify(ScrambledWordArray.reverse()) !== JSON.stringify(WordArray))) {
    CreateScrambledWord(Word);
  } else if (Inbox[GameStat.MinIndex].alt) {
    if (!Inbox[GameStat.MinIndex].alt.split("-").includes(ScrambledWordArray)) {
      IsScrambledWordValid = true;
      DisplayScrambledWord(ScrambledWordArray, IsScrambledWordValid);
    } else {
      CreateScrambledWord(Word);
    }
  } else if (!Inbox[GameStat.MinIndex].alt) {
    IsScrambledWordValid = true;
    DisplayScrambledWord(ScrambledWordArray, IsScrambledWordValid);
  }
}
function DisplayScrambledWord(ScrambledWordArray, IsScrambledWordValid) {
  if (IsScrambledWordValid) {
    document.getElementById("word").innerHTML = "";
    for (n = 0; n < ScrambledWordArray.length; n++) {
      let LetterInput = document.createElement("input");
      LetterInput.className = "letter-input";
      LetterInput.readOnly = true;
      LetterInput.setAttribute("inert", "");
      LetterInput.value = ScrambledWordArray[n];
      document.getElementById("word").appendChild(LetterInput);
    }
    LoadHTMLElements("DisplayKeyboard");
    LoadHTMLElements("DisplayLetterBoxes");
  }
}
function CheckGuess(Guess) {
  if (Inbox[GameStat.MinIndex].IsWordSolved === false) {
    if (Guess == Inbox[GameStat.MinIndex].word || (Inbox[GameStat.MinIndex].alt && Inbox[GameStat.MinIndex].alt.split("-").includes(Guess))) {
      if (document.getElementById("hint-container")) {
        document.getElementById("hint-container").remove();
      }
      GameStat.TryCounter++;
      let Index = Inbox.findIndex((obj) => obj.word === Inbox[GameStat.MinIndex].word);
      Inbox[Index].IsWordSolved = true;
      LevelHandler("CheckForLevelUp");
      CalcReward();
      ResetTimer();
      GameStat.TryCounter = 0;
      IndexOfBox = 0;
      GetWord();
    } else {
      GameStat.TryCounter++;
      Keyboard("clearInputs");
      IndexOfBox = 0;
      UIHandler("DisplayMessage", `<img src="Icons/CrossSign.png"> اشتباهه`);
      AudioManager("WrongAnswer");
    }
  } else {
    UIHandler("DisplayMessage", "این کلمه رو قبلا حل کردی !!");
  }
}
function CalcReward() {
  let tempreward = BaseReward;
  if (GameStat.TryCounter === 1) {
    tempreward = BaseReward;
    CalcRewardTime();
  } else if (GameStat.TryCounter >= 2 && GameStat.TryCounter <= 4) {
    tempreward -= 2;
    CalcRewardTime();
  } else if (GameStat.TryCounter > 4) {
    tempreward -= 4;
    CalcRewardTime();
  }
  function CalcRewardTime() {
    if (GameStat.Time <= 10) {
      tempreward += 5;
    } else if (GameStat.Time <= 30) {
      tempreward += 2;
    } else if (GameStat.Time > 30 && GameStat.Time <= 60) {
      tempreward += 1;
    } else if (GameStat.Time > 120) {
      tempreward -= 0;
    }
  }
  UpdateGameStat("IncrementCoins", tempreward);
}
// Functions Related to GUI and Updating/Chaning Visuals of the Game
function CreateHTMLElements(Action) {
  if (Action === "ReturnMusicTag") {
    // Define Music Audio Tag and Setting its attributes
    let Music = document.createElement("audio");
    Music.id = "music";
    Music.src = "./Music/Music1.mp3";
    Music.loop = true;
    return Music;
  }
  if (Action === "ReturnHeaderColumn1") {
    // Define Header
    let Header = document.createElement("header");
    // Define Header Columns(1)
    let HeaderColumn1 = document.createElement("section");
    HeaderColumn1.className = "header-column";
    HeaderColumn1.id = "header-column-1";
    // Defining Toggle Music Button
    let ToggleBgMusicBtn = document.createElement("button");
    ToggleBgMusicBtn.id = "toggle-bg-music-btn";
    ToggleBgMusicBtn.innerHTML = "<img src='Icons/NoMusicIcon.png'>";
    // Defining Home Button
    let HomePageBtn = document.createElement("button");
    HomePageBtn.id = "home-page-btn";
    HomePageBtn.innerHTML = "<img src='Icons/HomeIcon.png'>";
    // Defining Game Logo and Icon section
    let LogoContainer = document.createElement("section");
    LogoContainer.id = "logo-container";
    let Logo = document.createElement("section");
    Logo.id = "logo";
    Logo.innerHTML = "<img src='Icons/NoteBookIcon.png'>";
    let LogoText = document.createElement("section");
    LogoText.id = "logo-text";
    LogoText.innerText = "دفترچه";
    // Assemble Header Column 1
    Header.appendChild(HeaderColumn1);
    LogoContainer.appendChild(Logo);
    LogoContainer.appendChild(LogoText);
    HeaderColumn1.appendChild(LogoContainer);
    HeaderColumn1.appendChild(ToggleBgMusicBtn);
    HeaderColumn1.appendChild(HomePageBtn);
    // Seting Event Listeners
    ToggleBgMusicBtn.addEventListener("click", ToggleMusic);
    HomePageBtn.addEventListener("click", function () {
      LoadHTMLElements("DisplayHomePage");
    });
    return Header;
  }
  if (Action === "ReturnHeaderColumn2") {
    // Define Header Columns(2)
    let HeaderColumn2 = document.createElement("section");
    HeaderColumn2.className = "header-column";
    HeaderColumn2.id = "header-column-2";
    // Defining ShotSection and its components(BuyHint&BuyLetter)
    let ShopSection = document.createElement("section");
    ShopSection.id = "shop-section";
    let BuyHintBtn = document.createElement("button");
    BuyHintBtn.id = "buy-hint-btn";
    BuyHintBtn.className = "shop-section-btn";
    BuyHintBtn.title = "راهنمایی متنی : 30 سکه";
    BuyHintBtn.innerHTML = '<img src="Icons/HintIcon.png">';
    // Defining Coins Display
    let CoinsDisplay = document.createElement("span");
    CoinsDisplay.id = "coins";
    CoinsDisplay.setAttribute("inert", "");
    // Assemble Header Column 2
    HeaderColumn2.appendChild(CoinsDisplay);
    ShopSection.appendChild(BuyHintBtn);
    HeaderColumn2.appendChild(ShopSection);
    // Seting Event Listenrs
    BuyHintBtn.addEventListener("click", ShowHint);
    return HeaderColumn2;
  }
  if (Action === "ReturnLevelDisplay") {
    // Defining Level Display Tag
    let LevelDisplay = document.createElement("span");
    LevelDisplay.id = "level-display";
    LevelDisplay.setAttribute("inert", "");
    return LevelDisplay;
  }
  if (Action === "ReturnGameArea") {
    // Defining Game Area(Contains Scrambled Word and Hint section)
    let GameArea = document.createElement("section");
    GameArea.id = "game-area";
    // Defining The Section that Displays Scrambled Word
    let Word = document.createElement("span");
    Word.id = "word";
    // Assemble Game Area
    GameArea.appendChild(Word);
    // Return the GameArea
    return GameArea;
  }
  if (Action === "ReturnHintContainer") {
    // Defining Hint Section
    let HintContainer = document.createElement("span");
    HintContainer.id = "hint-container";
    return HintContainer;
  }
  if (Action === "ReturnHomePage") {
    // Defining Home Page
    let HomePage = document.createElement("section");
    HomePage.id = "home-page";
    // Defining Button Container
    let ButtonContainer = document.createElement("section");
    ButtonContainer.id = "button-container";
    // Defining Start New Game and Continue Game Buttons
    let StartNewGameBtn = document.createElement("button");
    StartNewGameBtn.id = "start-new-game-btn";
    StartNewGameBtn.innerText = "بازی جدید";
    let ContinueGameBtn = document.createElement("button");
    ContinueGameBtn.id = "continue-game-btn";
    ContinueGameBtn.innerText = "ادامه بازی";
    // Assemble Home Page
    HomePage.appendChild(ButtonContainer);
    ButtonContainer.appendChild(StartNewGameBtn);
    ButtonContainer.appendChild(ContinueGameBtn);
    // Seting Event Listeners
    StartNewGameBtn.addEventListener("click", () => {
      Start();
    });
    ContinueGameBtn.addEventListener("click", function () {
      ContinueGame();
    });
    return HomePage;
  }
  if (Action === "ReturnKeyboard") {
    // Defining LetterInputArray
    LetterInputArray = Array.from(document.getElementsByClassName("letter-input"));
    //  Defining Keyboard (I Named it KeyboardElement so it wont get confused with Keyboard() function)
    let KeyboardElement = document.createElement("section");
    KeyboardElement.id = "keyboard";
    // Defining KeysContainer
    let KeysContainer = document.createElement("section");
    KeysContainer.id = "keys-container";
    // Defining BackSpace(Delete) Key
    let BackSpace = document.createElement("button");
    BackSpace.id = "backspace-key";
    BackSpace.innerHTML = "<img src='Icons/CrossSign.png'>";
    // BackSpace.innerHTML = "<i class='fa fa-delete-left'></i>";
    // Assembling Keyboard
    KeyboardElement.appendChild(KeysContainer);
    KeyboardElement.appendChild(BackSpace);
    // Creating And appending Keys to KeysContainer
    let ControlDuplicateKeyArray = [];
    for (n = 0; n < LetterInputArray.length; n++) {
      if (!ControlDuplicateKeyArray.includes(LetterInputArray[n].value)) {
        ControlDuplicateKeyArray.push(LetterInputArray[n].value);
        let Key = document.createElement("button");
        Key.className = "key";
        Key.innerText = LetterInputArray[n].value;
        KeysContainer.appendChild(Key);
        Key.addEventListener("click", function () {
          Keyboard("type", this.innerText);
          CheckLetterBoxes();
        });
        if (n === LetterInputArray.length - 1) {
          SetKeysWidth();
        }
      }
    }
    // seting Event Listeners
    BackSpace.addEventListener("click", function () {
      Keyboard("DeleteLetter");
    });
    return KeyboardElement;
  }
  if (Action === "ReturnLetterBox") {
    const LetterBoxContainer = document.createElement("section");
    LetterBoxContainer.id = "letter-box-container";
    const KeyboardHeight = getComputedStyle(document.getElementById("keyboard")).height;
    const IntegerKeyboardHeight = parseInt(KeyboardHeight.substring(0, KeyboardHeight.length - 2));
    const ActuallKeyboardHeigh = IntegerKeyboardHeight + 21;
    LetterBoxContainer.style.bottom = ActuallKeyboardHeigh + "px";
    const NumberOfBoxes = Inbox[GameStat.MinIndex].word.split("").length;
    const Margin = NumberOfBoxes * 2;
    const Padding = NumberOfBoxes * 6;
    const ScreenWidth = Container.clientWidth * 0.9;
    const AvailableWidth = ScreenWidth - Margin - Padding;
    const BoxSize = AvailableWidth / NumberOfBoxes;
    //
    LetterBoxContainer.style.gridTemplateColumns = `repeat(${NumberOfBoxes},1fr)`;
    for (n = 0; n < Inbox[GameStat.MinIndex].word.split("").length; n++) {
      const Box = document.createElement("input");
      Box.className = "box";
      Box.readOnly = true;
      Box.style.width = `${BoxSize}px`;
      LetterBoxContainer.appendChild(Box);
    }
    GameStat.TryCounter = 0;
    StartTimer();
    return LetterBoxContainer;
  }
}
function LoadHTMLElements(Action) {
  if (Action === "LoadMusicTag") {
    // Remove PreExisting Music Tag Before Appending New one
    if (document.getElementById("music")) document.getElementById("music").remove();
    //
    const Music = CreateHTMLElements("ReturnMusicTag");
    Container.appendChild(Music);
  }
  if (Action === "DisplayHeaderColumn1") {
    // Remove PreExisting Header Before Appending New one
    if (document.getElementsByTagName("header")[0]) document.getElementsByTagName("header")[0].remove();
    //
    const HeaderColumn1 = CreateHTMLElements("ReturnHeaderColumn1");
    Container.appendChild(HeaderColumn1);
  }
  if (Action === "DisplayHeaderColumn2") {
    // Remove PreExisting HeaderColumn2 Before Appending New one
    if (document.getElementById("header-column-2")) document.getElementById("header-column-2").remove();
    //
    const HeaderColumn2 = CreateHTMLElements("ReturnHeaderColumn2");
    document.getElementsByTagName("header")[0].appendChild(HeaderColumn2);
  }
  if (Action === "DisplayLevel") {
    // Removing Game Logo and Its logo text and Replacing it with Game Level
    if (document.getElementById("logo-container")) document.getElementById("logo-container").remove();
    //
    const LevelDisplay = CreateHTMLElements("ReturnLevelDisplay");
    document.getElementById("header-column-1").appendChild(LevelDisplay);
  }
  if (Action === "DisplayHomePage") {
    // Remove PreExisting Home Page Before Appending New one
    if (document.getElementById("home-page")) document.getElementById("home-page").remove();
    //  Remove PreExisting HeaderColumn2 Before Displaying Home Page
    if (document.getElementById("header-column-2")) document.getElementById("header-column-2").remove();
    //  Remove PreExisting Game Area Before Displaying Home Page
    if (document.getElementById("game-area")) document.getElementById("game-area").remove();
    //  Remove PreExisting Keyboard Before Displaying Home Page
    if (document.getElementById("keyboard")) document.getElementById("keyboard").remove();
    //  Remove PreExisting LetterBoxContainer Before Displaying Home Page
    if (document.getElementById("letter-box-container")) document.getElementById("letter-box-container").remove();
    //
    const HomePage = CreateHTMLElements("ReturnHomePage");
    Container.appendChild(HomePage);
  }
  if (Action === "DisplayGameArea") {
    // Remove HomePage Before Displaying GameArea,Keyboard,LetterBox to user
    if (document.getElementById("home-page")) document.getElementById("home-page").remove();
    // Remove PreExisting Game Area Before Appending New one
    if (document.getElementById("game-area")) document.getElementById("game-area").remove();
    //
    const GameArea = CreateHTMLElements("ReturnGameArea");
    Container.appendChild(GameArea);
  }
  if (Action === "DisplayHintContainer") {
    let HintContainer = CreateHTMLElements("ReturnHintContainer");
    document.getElementById("game-area").appendChild(HintContainer);
  }
  if (Action === "DisplayKeyboard") {
    if (document.getElementById("keyboard")) document.getElementById("keyboard").remove();
    const Keyboard = CreateHTMLElements("ReturnKeyboard");
    Container.appendChild(Keyboard);
    SetKeysWidth();
  }
  if (Action === "DisplayLetterBoxes") {
    // Remove PreExisting LetterBox Before Appending New one
    if (document.getElementById("letter-box-container")) document.getElementById("letter-box-container").remove();
    const LetterBox = CreateHTMLElements("ReturnLetterBox");
    Container.appendChild(LetterBox);
  }
}
function UIHandler(Action, Message) {
  if (Action === "UpdateLevel") {
    document.getElementById("level-display").innerHTML = `<img src="Icons/LevelIcon.png"> ${GameStat.Level}`;
    PlacePersianNumbers("level-display");
  }
  if (Action === "UpdateCoins") {
    document.getElementById("coins").innerHTML = `${GameStat.Coins} <img src="Icons/coin-icon.png">`;
    PlacePersianNumbers("coins");
  }
  if (Action === "DisplayMessage") {
    if (document.getElementById("msg-box")) {
      document.getElementById("msg-box").remove();
    }
    const MsgBox = document.createElement("section");
    MsgBox.id = "msg-box";
    MsgBox.dir = "ltr";
    MsgBox.innerHTML = Message;
    MsgBox.style.position = "absolute";
    MsgBox.style.bottom = "200px";
    MsgBox.style.opacity = "0.8";
    Container.appendChild(MsgBox);
    setTimeout(function () {
      MsgBox.style.opacity = "0";
      MsgBox.style.transition = "1.5s";
    }, 1000);
    setTimeout(function () {
      MsgBox.remove();
    }, 2500);
  }
  if (Action === "ResizeLetterBox") {
    let LetterBoxArray = document.querySelectorAll(".box");
    const NumberOfBoxes = Inbox[GameStat.MinIndex].word.split("").length;
    const Margin = NumberOfBoxes * 2;
    const Padding = NumberOfBoxes * 6;
    const ScreenWidth = Container.clientWidth * 0.9;
    const AvailableWidth = ScreenWidth - Margin - Padding;
    const BoxSize = AvailableWidth / NumberOfBoxes;
    for (n = 0; n < LetterBoxArray.length; n++) {
      LetterBoxArray[n].style.width = BoxSize + "px";
    }
  }
}
function PlacePersianNumbers(TargetID) {
  let Target = document.getElementById(TargetID);
  const PersianNumbers = [
    { english: "0", persian: "۰" },
    { english: "1", persian: "۱" },
    { english: "2", persian: "۲" },
    { english: "3", persian: "۳" },
    { english: "4", persian: "۴" },
    { english: "5", persian: "۵" },
    { english: "6", persian: "۶" },
    { english: "7", persian: "۷" },
    { english: "8", persian: "۸" },
    { english: "9", persian: "۹" },
  ];
  for (n = 0; n < PersianNumbers.length; n++) {
    if (Target.innerHTML.includes(PersianNumbers[n].english)) {
      Target.innerHTML = Target.innerHTML.replaceAll(new RegExp(PersianNumbers[n].english, "g"), PersianNumbers[n].persian);
    }
  }
}
function SetKeysWidth() {
  // Each Key has a gap of 2px on right and left witch will be 4px in total.
  // AvailableWidthString is a string that has "px" in it we will remove that px and turn it into an Integer.
  // If Number of Keys are Even we will put Equal number of them on each row and all has equal width.
  // but if number of keys is odd then we do few extra calculations.

  // if Number of Keys is odd and less than 4 (less than 4 because i dont want to fit more than 4 keys in one row)
  // then we put all of them in one line so we simply give all of them equal width by dividing AvailableWidthInt by
  // number of keys.

  // but if number of keys is odd and more than 4 then we have to give all of them equal width excep for the last one
  // because last one is going to Fill the Gap for us by being wider.

  // We Divide AvailableWidthInt by 4 so we Make sure the first row or possibly second row are always 4 and have equal
  // width there is no other way if you want to devide it by NumberOfKeys it wont work as expected.

  // Then we Calculate Number of Keys on second Row , Why would we Mins 5 from NumberOfKeys ? for exm if we have 5 keys 4 of them should be on first row last one should take entire second row therefor nothing should be lessened from it so its gonna be 5-5 and if there are 6 we gonna lessen width of 6-5 * Keysize from it so it will leave space from other keys ,it may not make sense but just write things down on paper and try them with different words it will work.

  // if we reached last key we have to assign its width differently but if we did not then we just Assign normal common KeySize.
  let KeysArray = document.querySelectorAll(".key");
  const NumberOfKeys = KeysArray.length;
  const KeyboardPadding = 20;
  const GapSize = NumberOfKeys * 4;
  const AvailableWidth = Container.clientWidth - 95 - KeyboardPadding;
  console.log(AvailableWidth);
  if (NumberOfKeys % 2 === 0) {
    const KeySize = ((AvailableWidth - GapSize) * 2) / NumberOfKeys;
    for (n = 0; n < KeysArray.length; n++) {
      KeysArray[n].style.width = KeySize + "px";
    }
  } else {
    if (NumberOfKeys < 4) {
      const KeySize = AvailableWidth / NumberOfKeys;
      for (n = 0; n < KeysArray.length; n++) {
        KeysArray[n].style.width = KeySize + "px";
      }
    } else {
      const KeySize = (AvailableWidth - GapSize) / 4;
      const NumberOfKeysOfSecondRow = NumberOfKeys - 4;
      const SecondRowGapSize = NumberOfKeysOfSecondRow * 4;
      const LastKeySize = (AvailableWidth - SecondRowGapSize) / NumberOfKeysOfSecondRow;
      console.log(KeysArray.length, AvailableWidth, SecondRowGapSize, NumberOfKeysOfSecondRow, LastKeySize);
      for (n = 0; n < KeysArray.length; n++) {
        if (NumberOfKeys - n <= NumberOfKeysOfSecondRow) {
          KeysArray[n].style.width = LastKeySize + "px";
        } else {
          KeysArray[n].style.width = KeySize + "px";
        }
      }
    }
  }
}
// Functions Related to Keyboard and LetterBox
let IndexOfBox = 0;
function CheckLetterBoxes() {
  // this checks if the user has filled all the empty inputs to call the CheckGuess() Function;
  let BoxArray = Array.from(document.querySelectorAll(".box"));
  let UnFilledInputs = BoxArray.filter((Box) => {
    return Box.value === "";
  });
  if (UnFilledInputs.length !== 0) return;
  let GuessArray = [];
  BoxArray.forEach((Box) => {
    GuessArray.push(Box.value);
  });
  let GuessString = GuessArray.join("");
  console.log(GuessString);
  CheckGuess(GuessString);
}
function Keyboard(Action, Letter) {
  let BoxArray = document.querySelectorAll(".box");
  switch (Action) {
    case "type":
      if (IndexOfBox < BoxArray.length) {
        BoxArray[IndexOfBox].value = Letter;
        IndexOfBox++;
      }
      break;
    case "DeleteLetter":
      if (IndexOfBox !== 0) {
        BoxArray[IndexOfBox - 1].value = "";
        IndexOfBox--;
      }
      break;
    case "clearInputs":
      for (n = 0; n < BoxArray.length; n++) {
        BoxArray[n].value = "";
      }
  }
}
// Functions for Updating Game Status
function UpdateGameStat(action, value) {
  if (action === "NewGame") {
    GameStat.Coins = 0;
    GameStat.Life = 5;
    GameStat.Level = 1;
    GameStat.MinIndex = 0;
    GameStat.MaxIndex = Inbox.length - 1;
    GameStat.Time = 0;
    GameStat.TryCounter = 0;
    GameStat.IsMusicPlaying = true;
    LevelHandler("SetLevel");
    LevelHandler("SetIndex");
    UIHandler("UpdateCoins");
    UIHandler("UpdateLevel");
  } else if (action === "IncrementCoins") {
    UIHandler("DisplayMessage", `+${value}  <img src="Icons/coin-icon.png">`);
    PlacePersianNumbers("msg-box");
    let Cap = 0;
    let CoinAnimation = setInterval(function () {
      GameStat.Coins++;
      UIHandler("UpdateCoins");
      AudioManager("Coin");
      Cap++;
      if (Cap >= value) {
        clearInterval(CoinAnimation);
        SaveProgress("SaveAll");
      }
    }, 50);
  }
}
function LevelHandler(action) {
  switch (action) {
    case "SetLevel":
      switch (GameStat.Level) {
        case 1:
          Inbox = Lvl1;
          break;
        case 2:
          Inbox = Lvl2;
          break;
        case 3:
          Inbox = Lvl3;
          break;
        case 4:
          Inbox = Lvl4;
          break;
        case 5:
          Inbox = Lvl5;
          break;
        case 6:
          Inbox = Lvl6;
          break;
        case 7:
          Inbox = Lvl7;
          break;
        case 8:
          Inbox = Lvl8;
          break;
        case 9:
          Inbox = Lvl9;
          break;
        case 10:
          Inbox = Lvl10;
          break;
        case 11:
          Inbox = Lvl11;
          break;
        case 12:
          Inbox = Lvl12;
          break;
        case 13:
          Inbox = Lvl13;
          break;
        case 14:
          Inbox = Lvl14;
          break;
        case 15:
          Inbox = Lvl15;
          break;
      }
      break;
    case "SetIndex":
      GameStat.MinIndex = 0;
      GameStat.MaxIndex = Inbox.length - 1;
      break;
    case "IncrementIndex":
      if (GameStat.Level <= GameStat.MaxLevel && GameStat.MinIndex !== GameStat.MaxIndex) {
        GameStat.MinIndex++;
      } else {
        let WannaPlayAgain = confirm("بازی تمام شد میخوای دوباره بازی کنی؟");
        if (WannaPlayAgain) {
          Start();
        }
      }
      break;
    case "CheckForLevelUp":
      let UnSolvedWords = Inbox.filter((element) => element.IsWordSolved === false);
      if (UnSolvedWords.length === 0 && GameStat.Level < GameStat.MaxLevel) {
        GameStat.Level++;
        console.log("Level Handler Leveled Up the Game");
        AudioManager("LevelUp");
        LevelHandler("SetLevel");
        UIHandler("UpdateLevel");
        LevelHandler("SetIndex");
      } else {
        AudioManager("CorrectAnswer");
        LevelHandler("IncrementIndex");
      }
      break;
  }
}
function ShowHint() {
  if (document.getElementById("hint-container")) {
    document.getElementById("hint-container").remove();
  }
  if (GameStat.Coins < HintCost) {
    LoadHTMLElements("DisplayHintContainer");
    document.getElementById("hint-container").innerText = "امتیاز کافی نداری";
    return;
  }
  if (Inbox[GameStat.MinIndex].IsHintBought === true) {
    LoadHTMLElements("DisplayHintContainer");
    document.getElementById("hint-container").innerHTML = '<img src="Icons/HintIcon.png">' + Inbox[GameStat.MinIndex].Hint;
    return;
  } else {
    LoadHTMLElements("DisplayHintContainer");
    GameStat.Coins -= 30;
    Inbox[GameStat.MinIndex].IsHintBought = true;
    SaveProgress("SaveCoins");
    UIHandler("UpdateCoins");
    document.getElementById("hint-container").innerHTML = '<img src="Icons/HintIcon.png">' + Inbox[GameStat.MinIndex].Hint;
  }
}
// Functions Related for Saving Game Progress and Loading it
function SaveProgress(Action) {
  switch (Action) {
    case "SaveAll":
      localStorage.setItem("Level", GameStat.Level);
      localStorage.setItem("Index", GameStat.MinIndex);
      localStorage.setItem("Coins", GameStat.Coins);
      localStorage.setItem("MaxIndex", GameStat.MaxIndex);
      localStorage.setItem("Time", GameStat.Time);
      localStorage.setItem("TryCounter", GameStat.TryCounter);
      localStorage.setItem("IsMusicPlaying", GameStat.IsMusicPlaying);
      break;
    case "SaveLevel":
      localStorage.setItem("Level", GameStat.Level);
      break;
    case "SaveIndex":
      localStorage.setItem("Index", GameStat.MinIndex);
      break;
    case "SaveCoins":
      localStorage.setItem("Coins", GameStat.Coins);
      break;
    case "SaveMaxIndex":
      localStorage.setItem("MaxIndex", GameStat.MaxIndex);
      break;
    case "SaveTime":
      localStorage.setItem("Time", GameStat.Time);
      break;
    case "SaveTries":
      localStorage.setItem("TryCounter", GameStat.TryCounter);
      break;
    case "IsMusicPlaying":
      localStorage.setItem("IsMusicPlaying", GameStat.IsMusicPlaying);
      break;
  }
}
function LoadSave() {
  GameStat.Level = parseInt(localStorage.getItem("Level"));
  GameStat.MinIndex = parseInt(localStorage.getItem("Index"));
  GameStat.Coins = parseInt(localStorage.getItem("Coins"));
  GameStat.MaxIndex = parseInt(localStorage.getItem("MaxIndex"));
  GameStat.Time = parseInt(localStorage.getItem("Time"));
  GameStat.TryCounter = parseInt(localStorage.getItem("TryCounter"));
  GameStat.IsMusicPlaying = Boolean(localStorage.getItem("IsMusicPlaying"));
  LevelHandler("SetLevel");
  for (n = 0; n < GameStat.MinIndex; n++) {
    Inbox[n].IsWordSolved = true;
  }
  UIHandler("UpdateCoins");
  UIHandler("UpdateLevel");
}
