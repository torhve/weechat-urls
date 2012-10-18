#!/usr/bin/env python
# -*- coding: UTF-8
# Author: Tor Hveem <tor@hveem.no>

import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.schema import (Table, Column, PrimaryKeyConstraint, UniqueConstraint, ForeignKey, ForeignKeyConstraint, Index, MetaData)

from local_config import DBSTRING

Base = declarative_base()
engine = create_engine(DBSTRING, echo=False)

from sqlalchemy.orm import sessionmaker
Session = sessionmaker(bind=engine)
session = Session()

class Message(Base):
    __tablename__ = 'lines'
    __table_args__ = (UniqueConstraint('time', 'nick', 'message', name='_nick_message_uc'),)

    id = Column(Integer, primary_key=True)
    network = Column(String(20))
    time = Column(DateTime)
    buffer_name = Column(String(63))
    notice = Column(Integer) # 0
    prefix = Column(String(5))
    nick = Column(String(63))
    message = Column(String(512))


    def __init__(self, network, time, buffer_name, notice, prefix, nick, message):
        self.network = network
        self.time = time
        self.buffer_name = buffer_name
        self.notice = notice
        self.prefix = prefix
        self.nick = nick
        self.message = message


    def __repr__(self):
       return "<Message('%s','%s','%s','%s')>" % (self.network, self.buffer_name, self.time, self.nick, self.message)

if __name__ == '__main__':
    import sys
    import os
    import re
    Base.metadata.create_all(engine)

    log = sys.argv[1]
    buffer_name = os.path.basename(log)
    network = os.path.dirname(log).split('/')[-1]
    if not network:
        print "Give path to logfile, not just logfile. E.g. freenode/#weechat"
        sys.exit(1)
    print "Parsing logfile:", log
    counter = 0
    with open(log, 'r') as f:
        for line in f:
            parts = line.split('\t')
            time = parts[0]
            nick = parts[1]
            message = '\t'.join(parts[2:]).decode('UTF-8')
            prefix = ''

            # Parse notice
            notice = 0
            if '--' in nick: # Not a regular PRIVMSG
                notice = 1
                match = re.match('^Notice\((?P<nick>.+)\):', message)
                if not match:
                    # not a message, then. On we go
                    continue
                nick = match.groups()[0]
            # Get prefix
            match = re.match('(@|\+|&|%|!|~)', nick)
            if match:
                prefix = match.group()
                nick = nick.strip('@+%&!~')
            # Construct record
            dbl = Message(network, time, buffer_name, notice, prefix, nick, message)
            session.add(dbl)
            counter += 1
            # commit for evry x line, or it will use very much memory
            if counter == 80000:
                counter = 0
                session.commit()
    session.commit()
