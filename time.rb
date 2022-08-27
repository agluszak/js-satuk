REGEX = /(\d+) (\S+) o (\d+):(\d+)/


def unfacebook_date(s)
    s.match(REGEX) do |m|
        day = m.captures[0]
        month = get_month(m.captures[1].downcase())
        hour = m.captures[2]
        minutes = m.captures[3]

        puts day, month, hour, minutes
    end
end

def get_month(s) 
    case s 
    when "stycznia"
        return 1
    when "lutego"
        return 2
    when "marca"
        return 3
    when "kwietnia"
        return 4
    when "maja"
        return 5
    when "czerwca"
        return 6
    when "lipca"
        return 7
    when "sierpnia"
        return 8
    when "września"
        return 9
    when "października"
        return 10
    when "listopada"
        return 11
    when "grudnia"
        return 12
    else
        return nil
end

