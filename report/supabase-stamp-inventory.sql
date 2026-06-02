create table if not exists user_stamp_inventory (
  user_id uuid not null references users(id) on delete cascade,
  stamp_id text not null,
  quantity integer not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, stamp_id)
);

insert into user_stamp_inventory (user_id, stamp_id, quantity)
select id, 'yuubin-common', 5
from users
on conflict (user_id, stamp_id) do nothing;

alter table letters
add column if not exists stamp_id text default 'yuubin-common';

update letters
set stamp_id = 'yuubin-common'
where stamp_id is null;

create or replace function send_letter_with_stamp(
  p_sender_id uuid,
  p_recipient_id uuid,
  p_title text,
  p_content text,
  p_status text,
  p_language text,
  p_stamp_id text,
  p_sender_city_uuid_id uuid,
  p_recipient_city_uuid_id uuid,
  p_delivery_rule text,
  p_delivery_hours numeric,
  p_sent_at timestamptz,
  p_estimated_delivery_at timestamptz
)
returns letters
language plpgsql
security definer
as $$
declare
  sender_quantity integer;
  created_letter letters;
begin
  if p_status <> 'draft' then
    select quantity
    into sender_quantity
    from user_stamp_inventory
    where user_id = p_sender_id and stamp_id = p_stamp_id
    for update;

    if sender_quantity is null or sender_quantity < 1 then
      raise exception 'You do not have this stamp available';
    end if;

    update user_stamp_inventory
    set quantity = quantity - 1,
        updated_at = now()
    where user_id = p_sender_id and stamp_id = p_stamp_id;

    insert into user_stamp_inventory (user_id, stamp_id, quantity)
    values (p_recipient_id, p_stamp_id, 1)
    on conflict (user_id, stamp_id)
    do update set
      quantity = user_stamp_inventory.quantity + 1,
      updated_at = now();
  end if;

  insert into letters (
    sender_id,
    recipient_id,
    title,
    content,
    status,
    language,
    stamp_id,
    sender_city_uuid_id,
    recipient_city_uuid_id,
    delivery_rule,
    delivery_hours,
    sent_at,
    estimated_delivery_at
  )
  values (
    p_sender_id,
    p_recipient_id,
    p_title,
    p_content,
    p_status,
    p_language,
    p_stamp_id,
    p_sender_city_uuid_id,
    p_recipient_city_uuid_id,
    p_delivery_rule,
    p_delivery_hours,
    p_sent_at,
    p_estimated_delivery_at
  )
  returning * into created_letter;

  return created_letter;
end;
$$;
