const upDownAnimation : string = 'moveUpDown 1.5s ease-in-out infinite';
const increaseDecreaseAnimation : string = 'increaseDecrease 1.5s ease-in-out infinite';
const pulseAnimation : string = 'pulse 4s ease-out infinite';

export function animateElements() {
  const containerImages = document.querySelectorAll(".container-image") as NodeListOf<HTMLElement>;
  const circularShadows = document.querySelectorAll(".circular-shadow") as NodeListOf<HTMLElement>;
  var iframe = document.getElementById("navbar") as HTMLIFrameElement;
  const iframeDocument = iframe.contentDocument || iframe.contentWindow!.document;
  const button = iframeDocument.getElementById("upload-button") as HTMLElement;

  if(containerImages != null){
      for (let i = 0; i < containerImages.length; i++) {
          setTimeout(() => {
          if (containerImages[i] instanceof HTMLElement && circularShadows[i] instanceof HTMLElement) {
              containerImages[i].style.animation = upDownAnimation;
              circularShadows[i].style.animation = increaseDecreaseAnimation;
          }
          }, i * 250);
      }

      button.style.animation = pulseAnimation;
  }
}
  