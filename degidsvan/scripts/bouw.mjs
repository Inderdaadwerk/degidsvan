/* Genereert de vaste pagina's in public/ met dezelfde kop en voet als de rest van de site. */
import { writeFileSync } from "node:fs";
import { CATS, catNaam, esc } from "../src/gids.mjs";
import { LOGO, layout, kruimel } from "../src/ui.mjs";

const uit = (f, html) => writeFileSync(new URL("../public/" + f, import.meta.url), html.replace('<link rel="canonical" href="https://degidsvan.nl/', `<link rel="canonical" href="https://degidsvan.nl/`));
const pagina = (f, titel, omschrijving, body) => uit(f, layout({ titel, omschrijving, pad: "/" + f, body }));

const RMG = `<div class="kader"><p><b>RMG Uitgeverij B.V.</b><br>Rijzanthe 6, 3454 PV De Meern<br>KvK-nummer 87434970<br>Btw-nummer NL864293562B01<br>E-mail: <a href="mailto:info@degidsvan.nl">info@degidsvan.nl</a></p></div>`;
const catOpties = CATS.filter(([s]) => !["winkels", "vakmensen", "kantoren"].includes(s)).map(([s]) => `<option value="${s}">${esc(catNaam(s))}</option>`).join("") + '<option value="anders">Anders</option>';
const honey = `<p class="verborgen"><label>Niet invullen: <input name="bot-veld"></label></p>`;
const privacyCheck = `<label class="check"><input type="checkbox" required> <span>Ik ga akkoord met de verwerking van deze gegevens volgens de <a href="/privacy.html" target="_blank">privacyverklaring</a>.</span></label>`;

pagina("aanmelden.html", "Bedrijf aanmelden", "Meld uw bedrijf gratis aan in De Gids Van.", `<section class="wrap blok smal tekst">
${kruimel([["Bedrijf aanmelden", null]])}
<h1>Bedrijf aanmelden</h1>
<p class="sub">Staat uw bedrijf nog niet in De Gids Van? Meld het gratis aan. Wij controleren de gegevens en zetten uw bedrijf zo snel mogelijk online.</p>
<form class="form" name="aanmelden" method="POST" action="/bedankt.html" data-netlify="true" netlify-honeypot="bot-veld">
  <input type="hidden" name="form-name" value="aanmelden">${honey}
  <label>Bedrijfsnaam<input name="bedrijfsnaam" required maxlength="90"></label>
  <label>Categorie<select name="categorie" required><option value="">Kies een categorie</option>${catOpties}</select></label>
  <div class="twee"><label>Straat en huisnummer<input name="adres" required maxlength="100"></label><label>Postcode<input name="postcode" required maxlength="8"></label></div>
  <div class="twee"><label>Plaats<input name="plaats" required maxlength="60"></label><label>Telefoon<input name="telefoon" type="tel" maxlength="30"></label></div>
  <div class="twee"><label>E-mailadres<input name="email" type="email" required maxlength="120"></label><label>Website <span class="klein-t">(optioneel)</span><input name="website" maxlength="200"></label></div>
  <label>Uw naam<input name="contactpersoon" required maxlength="80"></label>
  <label>Korte omschrijving <span class="klein-t">(optioneel)</span><textarea name="omschrijving" maxlength="1000"></textarea></label>
  <label class="check"><input type="checkbox" name="meer-info" value="ja"> <span>Ik wil ook informatie over een uitgebreide vermelding met foto's, logo en extra zichtbaarheid.</span></label>
  ${privacyCheck}
  <button class="knop groot" type="submit">Aanmelding versturen</button>
</form>
</section>`);

pagina("wijzigen.html", "Vermelding wijzigen of verwijderen", "Pas uw vermelding in De Gids Van aan, vul hem aan of laat hem verwijderen.", `<section class="wrap blok smal tekst">
${kruimel([["Vermelding wijzigen", null]])}
<h1>Vermelding wijzigen of verwijderen</h1>
<p class="sub">Klopt er iets niet, wilt u uw vermelding aanvullen of wilt u niet in De Gids Van staan? Laat het ons weten. Verwijderverzoeken verwerken wij binnen 5 werkdagen.</p>
<p id="w-over" class="kader" hidden></p>
<form class="form" name="wijzigen" method="POST" action="/bedankt.html" data-netlify="true" netlify-honeypot="bot-veld">
  <input type="hidden" name="form-name" value="wijzigen">${honey}
  <input type="hidden" name="vermelding-id"><input type="hidden" name="vermelding-plaats">
  <label>Wat wilt u doen?<select name="verzoek" required><option value="aanpassen">Gegevens aanpassen</option><option value="uitbreiden">Vermelding uitbreiden (foto's, logo, omschrijving)</option><option value="verwijderen">Vermelding verwijderen</option></select></label>
  <label>Bedrijfsnaam<input name="bedrijfsnaam" required maxlength="90"></label>
  <div class="twee"><label>Uw naam<input name="naam" required maxlength="80"></label><label>Uw functie<input name="functie" maxlength="60" placeholder="Bijv. eigenaar"></label></div>
  <div class="twee"><label>E-mailadres<input name="email" type="email" required maxlength="120"></label><label>Telefoon<input name="telefoon" type="tel" maxlength="30"></label></div>
  <label>Toelichting<textarea name="toelichting" maxlength="2000" placeholder="Bijv. het nieuwe telefoonnummer of de juiste openingstijden"></textarea></label>
  ${privacyCheck}
  <button class="knop groot" type="submit">Verzoek versturen</button>
</form>
<script>
(function(){var q=new URLSearchParams(location.search),f=document.forms.wijzigen;
if(q.get('id')){f['vermelding-id'].value=q.get('id');f['vermelding-plaats'].value=q.get('plaats')||'';}
if(q.get('naam')){f.bedrijfsnaam.value=q.get('naam');var o=document.getElementById('w-over');o.textContent='Het gaat om de vermelding van '+q.get('naam')+'.';o.hidden=false;}})();
</script>
</section>`);

pagina("contact.html", "Contact", "Neem contact op met De Gids Van.", `<section class="wrap blok smal tekst">
${kruimel([["Contact", null]])}
<h1>Contact</h1>
<p class="sub">Heeft u een vraag over De Gids Van of over uw vermelding? Stuur ons een bericht. Wij reageren binnen 3 werkdagen. U kunt ook mailen naar <a href="mailto:info@degidsvan.nl">info@degidsvan.nl</a>.</p>
<form class="form" name="contact" method="POST" action="/bedankt.html" data-netlify="true" netlify-honeypot="bot-veld">
  <input type="hidden" name="form-name" value="contact">${honey}
  <div class="twee"><label>Uw naam<input name="naam" required maxlength="80"></label><label>Bedrijfsnaam <span class="klein-t">(optioneel)</span><input name="bedrijfsnaam" maxlength="90"></label></div>
  <div class="twee"><label>E-mailadres<input name="email" type="email" required maxlength="120"></label><label>Telefoon <span class="klein-t">(optioneel)</span><input name="telefoon" type="tel" maxlength="30"></label></div>
  <label>Uw bericht<textarea name="bericht" required maxlength="3000"></textarea></label>
  ${privacyCheck}
  <button class="knop groot" type="submit">Bericht versturen</button>
</form>
</section>`);

pagina("bedankt.html", "Bedankt", "Uw bericht is verstuurd.", `<section class="wrap blok smal tekst"><h1>Bedankt!</h1><p class="sub">Wij hebben uw bericht ontvangen en nemen binnen 3 werkdagen contact met u op.</p><p><a class="knop" href="/">Terug naar De Gids Van</a></p></section>`);

pagina("over-ons.html", "Over De Gids Van", "Over De Gids Van en de organisatie erachter.", `<section class="wrap blok smal tekst">
${kruimel([["Over De Gids Van", null]])}
<h1>Over De Gids Van</h1>
<p class="sub">De Gids Van helpt mensen snel een betrouwbaar bedrijf in de buurt te vinden, en helpt lokale ondernemers om gevonden te worden.</p>
<h2>Wat wij doen</h2>
<p>In De Gids Van staan bedrijven, winkels en vakmensen uit heel Nederland, overzichtelijk per plaats en per categorie. Iedere ondernemer kan zijn bedrijf gratis aanmelden. Wie meer wil opvallen, kan zijn vermelding uitbreiden met een logo, foto's, een omschrijving en een uitgelichte plek.</p>
<h2>Waar komen de gegevens vandaan?</h2>
<p>De basisgegevens van bedrijven komen uit openbare bronnen, waaronder OpenStreetMap (© OpenStreetMap-bijdragers, beschikbaar onder de Open Database License). Ondernemers kunnen hun gegevens altijd laten aanpassen, aanvullen of verwijderen via <a href="/wijzigen.html">Vermelding wijzigen</a>.</p>
<p>Het nieuws op De Gids Van komt automatisch van de Rijksoverheid (hergebruik toegestaan onder CC0). Bij elk bericht staat een link naar de bron.</p>
<h2>Onderdeel van de Regionale Media Groep</h2>
<p>De Gids Van is onderdeel van de Regionale Media Groep. De Gids Van wordt uitgegeven door:</p>
${RMG}
</section>`);

pagina("privacy.html", "Privacyverklaring", "Hoe De Gids Van omgaat met persoonsgegevens.", `<section class="wrap blok smal tekst">
${kruimel([["Privacyverklaring", null]])}
<h1>Privacyverklaring</h1>
<p class="sub">Laatst bijgewerkt: 6 november 2026</p>
<p>In deze privacyverklaring leest u welke persoonsgegevens De Gids Van verwerkt, waarom, hoe lang en welke rechten u heeft. Wij houden ons aan de Algemene verordening gegevensbescherming (AVG).</p>
<h2>Wie is verantwoordelijk?</h2>
<p>De Gids Van wordt uitgegeven door RMG Uitgeverij B.V., die verantwoordelijk is voor de verwerking van persoonsgegevens.</p>${RMG}
<h2>Bedrijfsvermeldingen</h2>
<p>De Gids Van toont zakelijke gegevens van bedrijven: bedrijfsnaam, categorie, adres, telefoonnummer, website en openingstijden. De basisgegevens komen uit openbare bronnen, waaronder OpenStreetMap. Gaat het om een eenmanszaak, dan kunnen deze gegevens ook persoonsgegevens zijn.</p>
<p>Wij verwerken deze gegevens op basis van ons gerechtvaardigd belang: een openbare, actuele bedrijvengids waarmee mensen bedrijven in hun omgeving kunnen vinden. Wij tonen alleen zakelijke gegevens, geen privégegevens.</p>
<p><b>Bezwaar en verwijdering:</b> wilt u niet in De Gids Van staan, of kloppen uw gegevens niet? Vul het formulier op <a href="/wijzigen.html">Vermelding wijzigen of verwijderen</a> in of mail naar <a href="mailto:info@degidsvan.nl">info@degidsvan.nl</a>. Wij verwijderen of corrigeren uw vermelding binnen 5 werkdagen en zorgen dat hij niet terugkomt bij een volgende update.</p>
<h2>Uitgebreide vermeldingen</h2>
<p>Neemt u een uitgebreide vermelding af, dan verwerken wij de gegevens die u daarvoor aanlevert (zoals teksten, foto's, logo en contactgegevens) en de gegevens die nodig zijn voor de overeenkomst, de facturatie en de betaling. Grondslag: uitvoering van de overeenkomst en wettelijke verplichtingen.</p>
<h2>Formulieren en e-mail</h2>
<p>Als u een formulier invult of ons mailt, verwerken wij uw naam, e-mailadres, telefoonnummer, bedrijfsnaam en uw bericht om uw verzoek af te handelen. Grondslag: gerechtvaardigd belang of, bij een aanvraag voor een vermelding, de uitvoering van een (toekomstige) overeenkomst.</p>
<h2>Hoe lang bewaren wij gegevens?</h2>
<ul><li>Berichten via formulieren: maximaal 2 jaar na afhandeling.</li><li>Gegevens over overeenkomsten en facturen: 7 jaar (fiscale bewaarplicht).</li><li>Verwijderverzoeken: zolang nodig om te voorkomen dat uw vermelding terugkomt.</li></ul>
<h2>Met wie delen wij gegevens?</h2>
<p>Wij verkopen geen gegevens. Wij werken met dienstverleners voor hosting, formulieren, e-mail, betalingen en administratie. Met hen zijn afspraken gemaakt over beveiliging en vertrouwelijkheid. Sommige zijn gevestigd buiten de Europese Economische Ruimte. De doorgifte gebeurt dan op basis van de waarborgen uit de AVG, zoals de standaardcontractbepalingen van de Europese Commissie.</p>
<h2>Cookies</h2>
<p>De Gids Van gebruikt <b>geen tracking-, analyse- of advertentiecookies</b>. Lettertypen en afbeeldingen worden vanaf onze eigen server geladen. Onze hostingpartij bewaart om technische en beveiligingsredenen korte tijd serverlogbestanden, waaronder uw IP-adres.</p>
<h2>Uw rechten</h2>
<p>U heeft het recht op inzage, correctie, verwijdering, beperking, bezwaar en overdraagbaarheid van uw gegevens. Stuur uw verzoek naar <a href="mailto:info@degidsvan.nl">info@degidsvan.nl</a>. Wij reageren binnen een maand. U kunt ook een klacht indienen bij de <a href="https://autoriteitpersoonsgegevens.nl" rel="noopener">Autoriteit Persoonsgegevens</a>.</p>
<h2>Wijzigingen</h2>
<p>Wij kunnen deze verklaring aanpassen. De meest recente versie staat altijd op deze pagina.</p>
</section>`);

pagina("disclaimer.html", "Disclaimer", "Disclaimer van De Gids Van.", `<section class="wrap blok smal tekst">
${kruimel([["Disclaimer", null]])}
<h1>Disclaimer</h1>
<p class="sub">Laatst bijgewerkt: 6 november 2026</p>
<h2>Juistheid van gegevens</h2>
<p>De Gids Van wordt met zorg samengesteld. Toch kunnen gegevens van bedrijven onjuist, onvolledig of verouderd zijn, onder meer omdat basisgegevens uit openbare bronnen komen. Controleer belangrijke informatie, zoals openingstijden, altijd bij het bedrijf zelf.</p>
<h2>Geen aanbeveling</h2>
<p>Een vermelding in De Gids Van is geen aanbeveling of keurmerk. Het label “Geverifieerd” betekent alleen dat het bedrijf zijn gegevens zelf heeft aangeleverd of bevestigd. Wij zijn niet verantwoordelijk voor de producten en diensten van vermelde bedrijven.</p>
<h2>Nieuws</h2>
<p>Nieuwsberichten worden automatisch overgenomen van de Rijksoverheid, met een bronvermelding en link naar het oorspronkelijke bericht. Raadpleeg voor de volledige en meest actuele informatie altijd de bron.</p>
<h2>Aansprakelijkheid</h2>
<p>RMG Uitgeverij B.V. is niet aansprakelijk voor schade door het gebruik van deze website of door het vertrouwen op de informatie die erop staat, tenzij er sprake is van opzet of grove nalatigheid. Wij zijn niet verantwoordelijk voor de inhoud van websites van derden waarnaar wordt verwezen.</p>
<h2>Intellectueel eigendom</h2>
<p>De vormgeving, teksten en het logo van De Gids Van zijn eigendom van RMG Uitgeverij B.V. Basisgegevens van bedrijven: © OpenStreetMap-bijdragers, beschikbaar onder de <a href="https://opendatacommons.org/licenses/odbl/" rel="noopener">Open Database License</a>.</p>
<h2>Onafhankelijk</h2>
<p>De Gids Van is een zelfstandige gids en is niet verbonden aan Google, De Telefoongids, de KvK of andere gidsen of overheidsinstanties.</p>
</section>`);

pagina("voorwaarden.html", "Voorwaarden", "Voorwaarden van De Gids Van.", `<section class="wrap blok smal tekst">
${kruimel([["Voorwaarden", null]])}
<h1>Voorwaarden</h1>
<p class="sub">Laatst bijgewerkt: 6 november 2026</p>
<h2>Gratis basisvermelding</h2>
<p>Een basisvermelding in De Gids Van is gratis en zonder verplichtingen. U kunt hem altijd laten aanpassen of verwijderen via <a href="/wijzigen.html">Vermelding wijzigen</a>.</p>
<h2>Uitgebreide vermelding</h2>
<p>Voor een uitgebreide vermelding ontvangt u altijd eerst een persoonlijk voorstel. Daarin staan de inhoud, de looptijd, het tarief en de betaalwijze, samen met de bijbehorende voorwaarden. Die kunt u inzien en downloaden <b>voordat</b> u akkoord geeft. Pas na uw akkoord komt de overeenkomst tot stand en ontvangt u een bevestiging met alle afspraken.</p>
<h2>Voorwaarden opvragen</h2>
<p>Wilt u de voorwaarden vooraf of opnieuw ontvangen? Mail naar <a href="mailto:info@degidsvan.nl">info@degidsvan.nl</a>, dan sturen wij ze u kosteloos toe.</p>
<h2>Gebruik van de website</h2>
<p>Het is niet toegestaan gegevens uit De Gids Van geautomatiseerd te verzamelen of te hergebruiken voor commerciële doeleinden zonder schriftelijke toestemming.</p>
</section>`);

writeFileSync(new URL("../public/logo.svg", import.meta.url), LOGO.replace('class="logo-ic" aria-hidden="true"', 'xmlns="http://www.w3.org/2000/svg"'));
console.log("klaar");
