<?php
/**
 * IBERIA — form handler (contact + event registration)
 * Emails the club + appends each submission to a CSV "sheet".
 * Diagnostic build: reports the real reason if something fails.
 */

error_reporting(E_ALL);
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');

$CLUB_EMAIL = 'info@iberia.org.ge';
$FROM       = 'noreply@iberia.org.ge';

function respond($ok, $extra = []){ echo json_encode(array_merge(['ok'=>$ok], $extra)); exit; }
function clean($v){ return trim(str_replace(["\r","\n","%0a","%0d"], ' ', (string)$v)); }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, ['error'=>'method']);
}

if (!empty($_POST['website'])) respond(true);

$action = $_POST['action'] ?? '';
$email  = clean($_POST['email'] ?? '');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) respond(false, ['error'=>'email']);

$first = clean($_POST['first'] ?? '');
$last  = clean($_POST['last']  ?? '');
$phone = clean($_POST['phone'] ?? '');
if ($first === '' || $last === '') respond(false, ['error'=>'name']);

$privateDir = dirname(__DIR__) . '/private';
if (!is_dir($privateDir)) { @mkdir($privateDir, 0750, true); }
if (!is_dir($privateDir) || !is_writable($privateDir)) {
    $privateDir = __DIR__ . '/_data';
    if (!is_dir($privateDir)) { @mkdir($privateDir, 0750, true); }
}
if (!is_dir($privateDir) || !is_writable($privateDir)) {
    respond(false, ['error'=>'no_write', 'tried'=>$privateDir]);
}

$stamp = date('Y-m-d H:i:s');

if ($action === 'register') {
    $event = clean($_POST['event'] ?? '');
    $type  = ($_POST['type'] ?? '') === 'club' ? 'club' : 'individual';
    $club  = clean($_POST['club'] ?? '');
    $clubOther = clean($_POST['club_other'] ?? '');
    if ($club === 'other' && $clubOther !== '') $club = $clubOther;
    if ($type === 'individual') $club = '';

    $csv = $privateDir . '/registrations.csv';
    $isNew = !file_exists($csv);
    $fh = @fopen($csv, 'a');
    if (!$fh) respond(false, ['error'=>'open_failed', 'path'=>$csv]);
    if ($isNew) fputcsv($fh, ['Date','Event','Type','Club','First name','Last name','Email','Phone']);
    fputcsv($fh, [$stamp, $event, $type, $club, $first, $last, $email, $phone]);
    fclose($fh);

    $subject = "ახალი რეგისტრაცია — $event";
    $bodyText = "ახალი რეგისტრაცია საიტიდან iberia.org.ge\n\n"
          . "ღონისძიება: $event\n"
          . "სტატუსი: " . ($type === 'club' ? "კლუბიდან ($club)" : "ფიზიკური პირი") . "\n"
          . "სახელი: $first $last\nელ.ფოსტა: $email\nტელეფონი: $phone\n\nდრო: $stamp";
} elseif ($action === 'contact') {
    $message = trim((string)($_POST['message'] ?? ''));
    if (mb_strlen($message) > 4000) $message = mb_substr($message, 0, 4000);

    $csv = $privateDir . '/messages.csv';
    $isNew = !file_exists($csv);
    $fh = @fopen($csv, 'a');
    if (!$fh) respond(false, ['error'=>'open_failed', 'path'=>$csv]);
    if ($isNew) fputcsv($fh, ['Date','First name','Last name','Email','Phone','Message']);
    fputcsv($fh, [$stamp, $first, $last, $email, $phone, $message]);
    fclose($fh);

    $subject = "ახალი შეტყობინება საიტიდან — $first $last";
    $bodyText = "ახალი შეტყობინება iberia.org.ge-დან\n\n"
          . "სახელი: $first $last\nელ.ფოსტა: $email\nტელეფონი: $phone\n\n"
          . "შეტყობინება:\n$message\n\nდრო: $stamp";
} else {
    respond(false, ['error'=>'action']);
}

$headers = "From: IBERIA <$FROM>\r\n"
         . "Reply-To: $first $last <$email>\r\n"
         . "MIME-Version: 1.0\r\n"
         . "Content-Type: text/plain; charset=utf-8\r\n";

$sent = @mail($CLUB_EMAIL, '=?UTF-8?B?' . base64_encode($subject) . '?=', $bodyText, $headers);

respond(true, ['mail' => $sent ? 'sent' : 'mail_failed']);